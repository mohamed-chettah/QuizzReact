import {
	getUserById,
	getUsers,
	loginUser,
	registerUser,
} from "../controllers/users.js";

import nodemailer from 'nodemailer'; // Importer nodemailer
import mjml from 'mjml';
import User from "../models/users.js"; // Importer mjml
import {Op} from "sequelize";

// Fonction pour générer le template de confirmation
const getConfirmationEmailTemplate = (firstName, confirmationLink) => {
	const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-preview>Confirmez votre compte maintenant</mj-preview>
        <mj-style inline="inline">
          .button:hover {
            background-color: #e65c5c !important;
          }
        </mj-style>
      </mj-head>
      <mj-body background-color="#f8f8f8">
      
        <!-- En-tête -->
        <mj-section background-color="#ffffff" padding="20px" border-radius="10px" text-align="center">
          <mj-column width="100%">
            <mj-text align="center" color="#333333" font-size="24px" font-weight="bold" padding="0">
              Bienvenue chez [[NomEntreprise]] !
            </mj-text>
            <mj-divider border-color="#FC7979" border-width="2px" padding-top="10px" padding-bottom="10px"></mj-divider>
          </mj-column>
        </mj-section>

        <!-- Message d'accueil -->
        <mj-section background-color="#ffffff" padding="20px" border-radius="10px">
          <mj-column width="100%">
            <mj-text align="left" color="#333333" font-size="18px" padding="0">
              Bonjour ${firstName},
            </mj-text>
            <mj-text align="left" color="#555555" font-size="16px" padding-top="10px">
              Merci de nous avoir rejoints ! Pour finaliser votre inscription, veuillez confirmer votre compte en cliquant sur le bouton ci-dessous :
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Bouton de confirmation -->
        <mj-section background-color="#ffffff" padding="20px" border-radius="10px">
          <mj-column width="100%" vertical-align="middle">
            <mj-button class="button" background-color="#FC7979" color="#ffffff" font-size="18px" font-weight="bold" border-radius="8px" padding="15px 30px" href="${confirmationLink}">
              Confirmer mon compte
            </mj-button>
          </mj-column>
        </mj-section>

        <!-- Informations supplémentaires -->
        <mj-section background-color="#ffffff" padding="20px" border-radius="10px">
          <mj-column width="100%">
            <mj-text align="left" color="#777777" font-size="14px">
              Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email. Ce lien de confirmation expirera dans 24 heures.
            </mj-text>
          </mj-column>
        </mj-section>


      </mj-body> 
    </mjml> 
  `;

	const htmlOutput = mjml(mjmlTemplate);
	return htmlOutput.html;
};

const transporter = nodemailer.createTransport({
	service : 'gmail',
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	}
});

export function usersRoutes(app) {
	app.post("/login", async (request, reply) => {
		reply.send(await loginUser(request.body, app));
	}).post(
		"/lo-gout",
		{preHandler: [app.authenticate]},
		async (request, reply) => {
			const token = request.headers["authorization"].split(" ")[1]; // Récupérer le token depuis l'en-tête Authorization

			// Ajouter le token à la liste noire
			blacklistedTokens.push(token);

			reply.send({logout: true});
		}
	);

	// Inscription
	app.post("/register", async (request, reply) => {
		// Créer l'utilisateur (fonction existante)
		const user = await registerUser(request.body, app.bcrypt);
		if (user) {
			const confirmationLink = `${process.env.API_URL}/confirm?token=${user.confirmationToken}`;

			const emailHtml = getConfirmationEmailTemplate(user.firstname, confirmationLink);

			const mailOptions = {
				from: 'quizup.gamesss@gmail.com',
				to: user.email,
				subject: 'Confirm your account',
				html: emailHtml,
			};

			// Envoyer l'email de confirmation
			await transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log('Error sending confirmation email:', error);
					reply.status(500).send({message: 'Error sending confirmation email'});
				} else {
					console.log('Confirmation email sent:', info.response);
					reply.send({message: 'User registered. Please check your email for confirmation.'});
				}
			});
		} else {
			reply.status(400).send({message: 'User registration failed'});
		}
	});

	app.get("/confirm", async (request, reply) => {
		const {token} = request.query;

		if (!token) {
			return reply.status(400).send({message: 'Token is missing'});
		}

		const user = await User.findOne({
			where: {
				confirmationToken: token,
				confirmationTokenExpires: {
					[Op.gt]: new Date(), // token doit être encore valide
				}
			}
		});

		if (!user) {
			return reply.status(400).send({message: 'Invalid or expired token'});
		}

		user.verified = true;
		user.confirmationToken = null;
		user.confirmationTokenExpires = null;
		await user.save();

		reply.send({message: 'Account confirmed successfully'});
	});


}
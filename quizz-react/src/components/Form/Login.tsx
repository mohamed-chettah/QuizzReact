import {SubmitHandler, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {useAuth} from "../../context/AuthContext.tsx";
import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";

// Schéma de validation avec Yup pour login/password au lieu de email
const schema = yup.object().shape({
    email: yup.string().email("l'email doit être valide").required("Email requis"),
    password: yup.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").required("Mot de passe requis"),
});

interface IFormInput {
    email: string;
    password: string;
}

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>({
        resolver: yupResolver(schema),
    });
    const { login: loginUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<IFormInput> = async (data : IFormInput) => {
        try {
            await loginUser(data);
            setError(null);
            navigate('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || "Une erreur s'est produite.";
            setError("Échec de la connexion. " + errorMessage);
        }
    };

    return (
        <div className="relative isolate bg-white dark:bg-gray-900">
            <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
                <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
                    <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
                        <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-900/10 dark:ring-gray-100/10 lg:w-1/2">
                            <svg
                                className="absolute inset-0 h-full w-full stroke-gray-200 dark:stroke-gray-700 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
                                aria-hidden="true"
                            >
                                <defs>
                                    <pattern
                                        id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                                        width={200}
                                        height={200}
                                        x="100%"
                                        y={-1}
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <path d="M130 200V.5M.5 .5H200" fill="none" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" strokeWidth={0} fill="white" className="dark:fill-gray-800" />
                                <svg x="100%" y={-1} className="overflow-visible fill-gray-50 dark:fill-gray-700">
                                    <path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
                                </svg>
                                <rect width="100%" height="100%" strokeWidth={0} fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Connexion</h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                            Pour jouer au meilleur jeu de quiz, veuillez vous connecter.
                        </p>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
                    <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                        <div className="grid grid-cols-1 gap-y-6">
                            <div>
                                <label htmlFor="login" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Email
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        {...register("email")}
                                        type="text"
                                        autoComplete="username"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email?.message}</p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Mot de passe
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        {...register("password")}
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {error && (
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                        <div className="mt-8 flex flex-col gap-4">
                            <button
                                type="submit"
                                className="rounded-md  bg-[#FB5757] hover:bg-[#FB5757]/80 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm
                                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                                "
                            >
                                Se connecter
                            </button>
                            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                                Pas encore de compte ?{' '}
                                <NavLink to="/register" className="font-semibold text-[#FB5757] ">
                                    S'inscrire
                                </NavLink>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
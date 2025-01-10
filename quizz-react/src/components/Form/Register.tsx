import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {useAuth} from "../../context/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {SubmitHandler, useForm} from "react-hook-form";
import {useState} from "react";
interface IFormInput {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
}

const schema = yup.object({
    firstname: yup.string().required("Le prénom est requis"),
    lastname: yup.string().required("Le nom est requis"),
    username: yup.string().required("Le nom d'utilisateur est requis"),
    email: yup.string().email("l'email doit être valide").required("L'email est requis"),
    password: yup.string().min(8, "Le mot de passe doit avoir 8 caractères minimum").max(16, "Password cannot exceed 16 characters").required("Password is required"),
}).required();

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>({
        resolver: yupResolver(schema),
    });
    const { registerUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            // Appel à la fonction d'enregistrement depuis le contexte
            await registerUser(data);
            setError(null)
            navigate('/login'); // Redirection vers la page d'accueil après inscription
        } catch (err) {
            setError("Inscription echoué " + err.message);
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
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Inscription</h2>
                        <p className="mt-4 text-lg text-gray-500">
                            Remplissez le formulaire à droite pour pouvoir jouer à nos jeux.
                        </p>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
                    <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="first-name"
                                       className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Prénom
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        {...register("firstname")}
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                    <p className="mt-2 text-sm text-red-500">{errors.firstname?.message}</p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="last-name"
                                       className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Nom
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        {...register("lastname")}
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                    <p className="mt-2 text-sm text-red-500">{errors.lastname?.message}</p>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="username"
                                       className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Nom d'utilisateur
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        {...register("username")}
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                    <p className="mt-2 text-sm text-red-500">{errors.username?.message}</p>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email"
                                       className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Email
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="email"
                                        {...register("email")}
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                    <p className="mt-2 text-sm text-red-500">{errors.email?.message}</p>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="password"
                                       className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Mot de passe
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="password"
                                        {...register("password")}
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                    <p className="mt-2 text-sm text-red-500">{errors.password?.message}</p>
                                </div>
                            </div>
                        </div>
                        {error && (
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500"
                            >
                                S'inscrire
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

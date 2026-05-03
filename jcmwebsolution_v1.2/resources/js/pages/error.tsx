import Forbidden from './errors/403';

type ErrorPageProps = {
    status: number;
};

export default function ErrorPage({ status }: ErrorPageProps) {
    if (status === 403) {
        return <Forbidden />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
            <div className="rounded-2xl bg-white p-8 text-center shadow">
                <h1 className="text-3xl font-bold text-slate-900">{status}</h1>
                <p className="mt-2 text-slate-600">Something went wrong.</p>
            </div>
        </div>
    );
}
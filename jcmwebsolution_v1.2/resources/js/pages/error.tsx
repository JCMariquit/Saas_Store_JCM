import Forbidden from './errors/403';

type ErrorPageProps = {
    status: number;
};

export default function ErrorPage({ status }: ErrorPageProps) {
    if (status === 403) {
        return <Forbidden />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-6">
            <div className="rounded-2xl bg-card p-8 text-center shadow">
                <h1 className="text-3xl font-bold text-foreground">{status}</h1>
                <p className="mt-2 text-muted-foreground">Something went wrong.</p>
            </div>
        </div>
    );
}
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { type FormEventHandler, useRef } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const closeModal = () => {
        clearErrors();
        reset();
    };

    const deleteUser: FormEventHandler = (event) => {
        event.preventDefault();

        destroy(route('account-removal.destroy'), {
            preserveScroll: true,
            onSuccess: closeModal,
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.035] p-4 md:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
                        <AlertTriangle className="size-4.5" />
                    </span>

                    <div className="min-w-0">
                        <p className="text-foreground text-sm font-semibold">Delete this account</p>
                        <p className="text-muted-foreground mt-1 max-w-2xl text-[10px] leading-5">
                            This permanently removes your user account and signs you out. This action cannot be undone.
                        </p>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button type="button" variant="destructive" className="h-10 shrink-0 rounded-lg px-4 text-xs">
                            <Trash2 className="size-3.5" />
                            Delete account
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogTitle>Delete your account?</DialogTitle>
                        <DialogDescription>
                            Your user account will be permanently deleted and you will be signed out. Enter your current password to confirm.
                        </DialogDescription>

                        <form className="space-y-5" onSubmit={deleteUser}>
                            <div className="space-y-2">
                                <Label htmlFor="delete-account-password" className="text-xs font-semibold">
                                    Current password
                                </Label>

                                <Input
                                    id="delete-account-password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    placeholder="Enter current password"
                                    autoComplete="current-password"
                                    disabled={processing}
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" onClick={closeModal} disabled={processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button type="submit" variant="destructive" disabled={processing}>
                                    <Trash2 className="size-3.5" />
                                    {processing ? 'Deleting...' : 'Permanently delete'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

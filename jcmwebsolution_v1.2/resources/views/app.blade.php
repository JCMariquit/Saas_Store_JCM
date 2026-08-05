<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'JCM Websolution Control Center') }}</title>

        <script>
            (() => {
                try {
                    const appearance = localStorage.getItem('appearance');
                    const theme = localStorage.getItem('theme-preset');
                    const allowedThemes = [
                        'jcm-dark',
                        'ocean-enterprise',
                        'violet-command',
                        'amber-operations',
                        'slate-minimal',
                    ];
                    const resolvedAppearance = appearance === 'light' ? 'light' : 'dark';
                    const resolvedTheme = allowedThemes.includes(theme) ? theme : 'jcm-dark';
                    const root = document.documentElement;

                    root.classList.toggle('dark', resolvedAppearance === 'dark');
                    root.dataset.appearance = resolvedAppearance;
                    root.dataset.theme = resolvedTheme;
                    root.style.colorScheme = resolvedAppearance;
                } catch (_) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.dataset.appearance = 'dark';
                    document.documentElement.dataset.theme = 'jcm-dark';
                    document.documentElement.style.colorScheme = 'dark';
                }
            })();
        </script>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>

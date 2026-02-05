module.exports = {
    apps: [
        {
            name: 'ssda-backend',
            script: './server/index.js',
            watch: true,
            ignore_watch: ['node_modules', 'logs', 'public', '.git'],
            env: {
                PORT: 3002,
                NODE_ENV: 'development'
            }
        },
        {
            name: 'ssda-frontend',
            script: 'npm',
            args: 'run dev',
            watch: false,
            env: {
                NODE_ENV: 'development'
            }
        }
    ]
};

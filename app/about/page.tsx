export default function About() {
  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-4xl font-semibold">About</h1>
      <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        This is a sample Next.js project with some basic features like
        routing, styling, and more.
      </p>
      <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        The project uses the following technologies:
      </p>
      <ul className="list-disc list-inside max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        <li>Next.js</li>
        <li>React</li>
        <li>TypeScript</li>
        <li>Tailwind CSS</li>
      </ul>
      <a
        href="/api/auth/saml/login"
        style={{
          padding: "12px 24px",
          backgroundColor: "#0078D4",
          color: "white",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "bold"
        }}
      >
        Login with Microsoft
      </a>
      <a href="/api/auth/saml/logout">
  Logout
</a>
    </div>
  );
}

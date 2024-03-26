// Without a defined matcher, this one line applies next-auth to the ENTIRE project.
export {default} from 'next-auth/middleware'; //apply next-auth to entire site

// To protect certain routes only: https://next-auth.js.org/configuration/nextjs#middleware
export const config = { matcher: ['/extra', '/dashboard'] };
import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Kundeti Monasri — The Mind Atlas',description:'An interconnected world of AI, people, culture and curiosity. Explore the work of Kundeti Monasri.',openGraph:{title:'Monasri — The Mind Atlas',description:'Different worlds. One connected curiosity.',type:'website'},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

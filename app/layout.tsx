import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Kundeti Monasri — AI & ML Portfolio | Mind Atlas',description:'Explore Kundeti Monasri’s AI and machine learning projects, contributions, research interests, and human-centered design work.',openGraph:{title:'Kundeti Monasri — Mind Atlas',description:'AI & ML projects, individual contributions, research interests, and human-centered design.',type:'website'},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

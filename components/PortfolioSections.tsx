import {memo,type RefObject} from 'react';
import {projects,projectHighlights,hackathonEvents,communities,experience,archive,type PortfolioProject} from '../data/portfolio';

type ProjectAction={onProject:(id:string)=>void};
function SectionHeading({number,topic,title,lead,id}:{number:string;topic:string;title:string;lead:string;id:string}){
 return <header className="section-heading"><p className="eyebrow"><span>{number}</span> {topic}</p><h2 id={id}>{title}</h2><p className="section-lead">{lead}</p></header>;
}
function SkillTags({items}:{items:string[]}){
 return <ul className="skill-tags" aria-label="Technologies and methods">{items.map(item=><li key={item}>{item}</li>)}</ul>;
}
function FeaturedProject({id,label='Featured connection',onProject}:ProjectAction&{id:string;label?:string}){
 const project=projects.find(p=>p.id===id)!;
 return <div className="featured-project"><p className="content-label">{label}</p><h3>{project.title}</h3><p>{project.description}</p><button className="text-action" onClick={()=>onProject(id)} aria-label={`Read ${project.title} case study`}>View project <span aria-hidden="true">↗</span></button></div>;
}
function ProjectCard({project,onProject}:ProjectAction&{project:PortfolioProject}){
 const highlight=projectHighlights[project.id];
 return <article className="project-card" aria-labelledby={`card-${project.id}`}>
  <div className="project-card-heading"><span className="project-number" aria-hidden="true">{project.number}</span><p className="project-category">{project.category}</p></div>
  <h3 id={`card-${project.id}`}>{project.title}</h3><p className="project-purpose">{project.description}</p>
  <dl className="project-facts"><div><dt>My contribution</dt><dd>{highlight.contribution}</dd></div><div className="project-output"><dt>Scope & output</dt><dd>{highlight.output}</dd></div></dl>
  <SkillTags items={project.tech.slice(0,3)}/>
  <button className="case-study-button" onClick={()=>onProject(project.id)} aria-label={`Read ${project.title} case study`}>Read case study <span aria-hidden="true">↗</span></button>
 </article>;
}

const PortfolioSections=memo(function PortfolioSections({onProject,inspect=false}:ProjectAction&{inspect?:boolean}){
 return <main id="journey" tabIndex={inspect?-1:0} aria-label="Portfolio details. Scroll to travel between the 3D worlds." inert={inspect} aria-hidden={inspect?true:undefined}>
  <section id="home" data-world="home" className="chapter hero" aria-labelledby="home-title" tabIndex={-1}>
   <article className="hero-content reading-panel">
    <p className="eyebrow">KUNDETI MONASRI · HYDERABAD</p>
    <h1 id="home-title"><span>Hi, I’m</span> Monasri.</h1>
    <p className="hero-role">AI & ML.<br/>Built around people.</p>
    <p className="hero-description">I build intelligent systems around human needs, from accessible computer vision to local-LLM workflows.</p>
    <SkillTags items={['AI & machine learning','Human-centered design','Generative AI']}/>
    <div className="hero-actions"><a className="button button-primary" href="#projects">View selected projects <span aria-hidden="true">↗</span></a><a className="button button-secondary" href="#psychology">Explore the worlds <span aria-hidden="true">↓</span></a></div>
    <div className="education-summary"><p className="content-label">Education</p><strong>MGIT, Hyderabad</strong><p>B.Tech · AI & ML · 2024–2028</p><span className="education-result">9.05 / 10 <span>CGPA</span></span></div>
   </article>
  </section>
  <section id="psychology" data-world="psychology" className="chapter" aria-labelledby="psychology-title" tabIndex={-1}>
   <article className="chapter-content reading-panel">
    <SectionHeading number="01" topic="PSYCHOLOGY" title="The Mind Garden" lead="Understanding people. Designing with intention." id="psychology-title"/>
    <p>Exploring emotion, personality, and human-centered interaction through the systems I build.</p>
    <SkillTags items={['Psychology','HCI','Human-centered design']}/>
    <FeaturedProject id="emotispace" onProject={onProject}/>
   </article>
  </section>
  <section id="ai" data-world="ai" className="chapter" aria-labelledby="ai-title" tabIndex={-1}>
   <article className="chapter-content reading-panel">
    <SectionHeading number="02" topic="ARTIFICIAL INTELLIGENCE" title="Intelligence Nexus" lead="From a useful model to a working system." id="ai-title"/>
    <p>My work connects computer vision, local language models, and model evaluation with practical interactions.</p>
    <div className="work-links" aria-label="Selected AI work">{[
     ['signspell','SignSpell AI','Webcam → hand landmarks → buffered text'],
     ['news','AI News Digest','News → local LLM → scheduled email'],
     ['benchmark','Learning to learn','Examples → model responses → evaluation']
    ].map(([id,name,flow])=><button key={id} onClick={()=>onProject(id)} aria-label={`Read ${name} case study`}><span><strong>{name}</strong><small>{flow}</small></span><span aria-hidden="true">↗</span></button>)}</div>
    <a className="text-action" href="#technology">Explore the systems behind my work <span aria-hidden="true">↓</span></a>
   </article>
  </section>
  <section id="projects" data-world="projects" className="chapter projects-chapter" aria-labelledby="projects-title" tabIndex={-1}>
   <article className="chapter-content reading-panel">
    <SectionHeading number="03" topic="SELECTED PROJECTS" title="The Project Atelier" lead="Ideas, built into working systems." id="projects-title"/>
    <p>A closer look at the questions, decisions, and systems behind my work.</p>
    <p className="gallery-note"><span aria-hidden="true">↗</span> One connected island. Five distinct exhibits.</p>
    <div className="project-list">{projects.map(project=><ProjectCard key={project.id} project={project} onProject={onProject}/>)}</div>
    <details className="archive"><summary>More experiments <span aria-hidden="true">＋</span></summary>{archive.map(([title,description])=><div key={title}><h3>{title}</h3><p>{description}</p></div>)}</details>
   </article>
  </section>
  <section id="culture" data-world="culture" className="chapter" aria-labelledby="culture-title" tabIndex={-1}>
   <article className="chapter-content reading-panel">
    <SectionHeading number="04" topic="CULTURE & CREATIVITY" title="Cultural Crossroads" lead="Art, music, movement, and human connection." id="culture-title"/>
    <p>Classical dance, writing, music, and cultural exploration shape the way I approach human experience and design.</p>
    <FeaturedProject id="culture" label="Creative exploration" onProject={onProject}/>
    <div className="achievement-card"><p className="content-label">Creative milestone · 2019</p><h3>Natya Kaustubh Award</h3><p>Classical dance · Mahathi Arts Academy</p></div>
   </article>
  </section>
  <section id="hackathons" data-world="hackathons" className="chapter" aria-labelledby="hackathons-title" tabIndex={-1}>
   <article className="chapter-content reading-panel">
    <SectionHeading number="05" topic="HACKATHONS & BUILDING" title="The Invention Yard" lead="Experiment. Collaborate. Build." id="hackathons-title"/>
    <p>Hackathons and ideathons give me a place to turn questions into experiments with other builders.</p>
    <ul className="event-list">{hackathonEvents.map(event=><li key={event.name}><div><h3>{event.name}</h3><p>{event.organization}</p></div><div className="event-meta"><span>{event.date}</span><span className="status-badge">{event.status}</span></div></li>)}</ul>
    <div className="experience-block"><h3 className="block-heading">Selected building experience</h3>{experience.slice(0,2).map(([date,title,org,detail])=><article className="experience-card" key={org}><p className="content-label">{date}</p><h4>{title}</h4><p><strong>{org}</strong><span>{detail}</span></p></article>)}</div>
    <details className="archive"><summary>Other experience <span aria-hidden="true">＋</span></summary>{experience.slice(2).map(([date,title,org,detail])=><div key={org}><p className="content-label">{date}</p><h3>{title} · {org}</h3><p>{detail}</p></div>)}</details>
   </article>
  </section>
  <section id="research" data-world="research" className="chapter" aria-labelledby="research-title" tabIndex={-1}>
   <article className="chapter-content reading-panel">
    <SectionHeading number="06" topic="RESEARCH & COMMUNITY" title="The Observatory" lead="How do intelligent systems learn and generalize?" id="research-title"/>
    <p>I explore rule learning, compositional reasoning, few-shot adaptation, memory, and feedback through an experimental learning benchmark.</p>
    <div className="research-evidence"><p className="content-label">Exploratory benchmark</p><strong>100 synthetic tasks</strong><p>Example prompts, response capture, and exact-match scoring.</p><button className="text-action" onClick={()=>onProject('benchmark')}>Explore the benchmark <span aria-hidden="true">↗</span></button></div>
    <div className="community-block"><h3 className="block-heading">Learning in community</h3>{communities.map(community=><article className="community-card" key={community.name}><h4>{community.name}</h4><p>{community.detail}</p></article>)}</div>
   </article>
  </section>
  <section id="technology" data-world="technology" className="chapter" aria-labelledby="technology-title" tabIndex={-1}>
   <article className="chapter-content reading-panel">
    <SectionHeading number="07" topic="TECHNOLOGY & SKILLS" title="The Systems Nexus" lead="Tools connected to the systems I build." id="technology-title"/>
    <p>The languages, models, and tools behind my selected work.</p>
    <div className="system-list">{[
     ['signspell','Computer vision & interaction'],['news','Local LLMs & automation'],['benchmark','Evaluation & reasoning'],['culture','Generative visual systems']
    ].map(([id,title])=>{const project=projects.find(p=>p.id===id)!;return <article className="system-card" key={id}><h3>{title}</h3><p className="system-context">Used in {project.title}</p><SkillTags items={project.tech}/><button className="text-action" onClick={()=>onProject(id)} aria-label={`See ${project.title} case study`}>See the system <span aria-hidden="true">↗</span></button></article>})}</div>
    <details className="archive"><summary>Selected learning <span aria-hidden="true">＋</span></summary><div><h3>CS50’s Introduction to Programming with Python</h3><p>Harvard University · July 2026</p><h3>Code in Place</h3><p>Stanford program · June 2026</p><h3>Programming Essentials in Python & Django</h3><p>TASK · March 2026</p><h3>Python for Data Science, AI & Development</h3><p>IBM · March 2025</p></div></details>
   </article>
  </section>
  <section id="future" data-world="future" className="chapter future" aria-labelledby="future-title" tabIndex={-1}>
   <article className="chapter-content reading-panel">
    <SectionHeading number="08" topic="THE NEXT CHAPTER" title="The Open Horizon" lead="From Hyderabad, with curiosity." id="future-title"/>
    <p>I’m looking toward higher education, deeper research, international collaboration, and new perspectives through cultural exploration.</p>
    <ul className="goal-list"><li><span aria-hidden="true">01</span><div><h3>Higher studies</h3><p>Deepen my foundations in intelligent systems.</p></div></li><li><span aria-hidden="true">02</span><div><h3>Research & collaboration</h3><p>Explore better questions with curious communities.</p></div></li><li><span aria-hidden="true">03</span><div><h3>Global exploration</h3><p>Learn across places, perspectives, and cultures.</p></div></li></ul>
    <div className="contact-block"><p className="content-label">Connect with me</p><h3>Let’s build something meaningful.</h3><div className="contact-links"><a className="button button-primary" href="https://www.linkedin.com/in/kundeti-monasri-3650ba326" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a><a className="button button-secondary" href="https://github.com/Monasri29-hub" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a></div></div>
    <a className="text-action" href="#home">Return to the whole atlas <span aria-hidden="true">↑</span></a>
   </article>
  </section>
 </main>;
});
export default PortfolioSections;

export function ProjectDetails({project,dialogRef,onClose}:{project:PortfolioProject|null;dialogRef:RefObject<HTMLDialogElement|null>;onClose:()=>void}){
 return <dialog ref={dialogRef} aria-labelledby={project?'project-dialog-title':undefined} aria-describedby={project?'project-dialog-summary':undefined} className="project-dialog" onCancel={event=>{event.preventDefault();onClose()}} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)onClose()}}}>
  <div className="dialog-toolbar"><span>PROJECT CASE STUDY</span><button className="close-dialog" autoFocus onClick={onClose} aria-label="Close project details">Close <span aria-hidden="true">×</span></button></div>
  {project&&<article className="dialog-body"><p className="eyebrow">PROJECT {project.number} · {project.category}</p><h2 id="project-dialog-title">{project.title}</h2><p className="dialog-lead" id="project-dialog-summary">{project.summary}</p><p>{project.description}</p>
   <div className="dialog-output"><p className="content-label">Scope & output</p><p>{project.outcome}</p></div>
   <h3>The question</h3><p>{project.problem}</p><h3>My contribution</h3><p>{project.contribution}</p><h3>The workflow</h3><ol className="workflow">{project.flow.map(step=><li key={step}>{step}</li>)}</ol><h3>Technologies & methods</h3><SkillTags items={project.tech}/>
   <a className="text-action" href="https://github.com/Monasri29-hub" target="_blank" rel="noopener noreferrer">Explore my GitHub profile <span aria-hidden="true">↗</span></a>
  </article>}
 </dialog>;
}

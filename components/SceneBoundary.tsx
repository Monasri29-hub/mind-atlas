'use client';
import {Component,type ReactNode} from 'react';

/** A failed GPU scene must never take the readable portfolio down with it. */
export default class SceneBoundary extends Component<{children:ReactNode;onFail:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(){this.props.onFail()}
 render(){return this.state.failed?null:this.props.children}
}

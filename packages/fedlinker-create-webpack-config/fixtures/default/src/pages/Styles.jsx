import React from 'react';
import CSS from '../components/CSS';
import CSSModule from '../components/CSSModule';
import Less from '../components/Less';
import LessModule from '../components/LessModule';
import Sass from '../components/Sass';
import SassModule from '../components/SassModule';
import Stylus from '../components/Stylus';
import StylusModule from '../components/StylusModule';

export default function Styles() {
  return (
    <>
      <h1>Styles</h1>
      <CSS>CSS</CSS>
      <CSSModule>CSSModule</CSSModule>
      <Less>Less</Less>
      <LessModule>LessModule</LessModule>
      <Sass>Sass</Sass>
      <SassModule>SassModule</SassModule>
      <Stylus>Stylus</Stylus>
      <StylusModule>StylusModule</StylusModule>
    </>
  );
}

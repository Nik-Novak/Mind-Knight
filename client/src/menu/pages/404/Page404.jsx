import React from 'react';

import Title from '../../components/title/Title';
import './Page404.scss';

function PageMain(){
  return (
    <section id="content" className="Page404">
      <Title>
        <h1>404</h1>
        <h2>Not Found</h2>
      </Title>
    </section>
  );
}

export default PageMain;
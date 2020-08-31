//@ts-check
import React from 'react';
import './Menu.scss';
import { Route, Switch } from 'react-router-dom'
import PageMain from './pages/main/PageMain';
import Page404 from './pages/404/Page404';
import Footer from './components/footer/Footer';

function Menu() {
  return (
    <div className="Menu">
      <Switch>
        <Route exact path="/" component={PageMain} />
        <Route path="/:id" component={Page404}/>
      </Switch>
      <Footer/>
    </div>
  );
}

export default Menu;

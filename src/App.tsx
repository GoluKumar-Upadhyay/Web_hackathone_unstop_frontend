import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Businessman_Home from './pages/Businessman_Home';
import Businessman_analytics from './pages/Businessman_analytics';
import Businessman_billing from './pages/Businessman_billing'
import Businessman_inventory from './pages/Businessman_inventory';
import Businessman_inventory_add from './pages/Businessman_inventory_add';
import Businessman_account from './pages/Businessman_account';
import Businessman_signin from './pages/Businessman_signin';
import Businessman_signup from './pages/Businessman_signup';
import Businessman_shopinfo from './pages/Businessman_shopinfo.';
import Businessman_order from './pages/Businessman_order';
import Businessman_shopimg from './pages/Businessman_shopimg';
import B_forget from './pages/B_forget';

import User_home from './pages/User_home';
import Divider from './pages/Divider';
import User_account from './pages/User_account'
import User_wallet from './pages/User_wallet';
import User_shop from './pages/User_shop';
import User_signup from './pages/User_signup';
import User_signup_helper_1 from './pages/User_signup_helper_1';

import User_login from './pages/User_login';

import Businessman_home1 from './pages/Businessman_home1';
import User_product from './pages/User_product';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';


import './theme/variables.css';


setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>

        <Route exact path="/divider"><Divider /></Route>
        
        
        <Route exact path="/user_home"><User_home /></Route>
        <Route exact path="/user_account"><User_account /></Route>
        <Route exact path="/user_shop"><User_shop /></Route>
        <Route exact path="/user_wallet"><User_wallet /></Route>
        <Route exact path="/user_signup"><User_signup /></Route>
        <Route exact path="/User_signup_helper_1"><User_signup_helper_1/></Route>
        <Route exact path="/user_login"><User_login /></Route>

        <Route exact path="/b_forget"><B_forget/></Route>
        <Route exact path="/businessman_home"><Businessman_Home /></Route>
        <Route exact path="/businessman_shopimg"><Businessman_shopimg /></Route>
        <Route exact path="/businessman_order"><Businessman_order /></Route>
        <Route exact path="/businessman_analytics"><Businessman_analytics/></Route>
        <Route exact path="/businessman_billing"><Businessman_billing /></Route>
        <Route exact path="/businessman_account"><Businessman_account/></Route>
        <Route exact path="/businessman_inventory"><Businessman_inventory /></Route>
        <Route exact path="/businessman_inventory_add"><Businessman_inventory_add /></Route>
        <Route exact path="/businessman_signin"><Businessman_signin /></Route>
        <Route exact path="/businessman_signup"><Businessman_signup /></Route>
        <Route exact path="/businessman_shopinfo"><Businessman_shopinfo /></Route>

        <Route exact path="/businessman_home1"><Businessman_home1 /></Route>
        <Route exact path="/user_product"><User_product /></Route>
        

      
        <Route exact path="/"><Redirect to="/Divider" /></Route>


      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

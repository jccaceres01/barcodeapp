import Vue from "nativescript-vue";

import Home from "./components/Home";
import SyncHomeComponent from './components/syncOffline/SyncHomeComponent';
import SyncItemsComponent from './components/syncOffline/SyncItemsComponent';

new Vue({

    template: `
        <Frame>
            <Home />
        </Frame>`,

    components: {
        Home,
        SyncHomeComponent,
        SyncItemsComponent
    }
}).$start();

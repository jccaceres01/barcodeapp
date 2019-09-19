import Vue from "nativescript-vue";

import Home from "./components/Home";
import SyncInventoryTicketComponent from './components/syncOffline/SyncInventoryTicketComponent'
import SyncNewInventoryTicketComponent from './components/syncOffline/SyncNewInventoryTicketComponent'

new Vue({

    template: `
        <Frame>
            <Home />
        </Frame>`,

    components: {
        Home,
        SyncInventoryTicketComponent,
        SyncNewInventoryTicketComponent,
    }
}).$start();

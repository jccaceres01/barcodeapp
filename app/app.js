import Vue from "nativescript-vue"
import store from './store/store.js'

// import Test from './components/test/Test'
import Home from "./components/Home"

Vue.config.silent = false

new Vue({

    template: `
        <Frame>
            <Home />
        </Frame>`,

    components: {
        Home
    },
    store: store
}).$start();

import Vue from 'nativescript-vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  // States
  state: {
    loading: false
  },
  // Mutations
  mutations: {
    setLoading(state, value) {
      state.loading = value
    }
  },
  // Actions
  actions: {
    test() {
      alert('Ok')
    },
    loadOn({commit}) {
      commit('setLoading', true)
    },
    loadOff({commit}) {
      commit('setLoading', false)
    }
  }
})

export default store

<template>
  <Page>
    <ActionBar title="Nueva Salida" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Label text="Nueva Salida: " fontSize="30" class="fa" />
      <TextField v-model="ni" hint="Número Interno" @returnPress="addNewOutput" keyboardType="text" height="50" class="t-uppercase" />
      <Button text="Crear Salida" @tap="addNewOutput" />
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import { Http } from '@nativescript/core'
  import { mapActions } from 'vuex'

  export default {
    props: {
      parent: {type: Object}
    },
    data() {
      return {
        api: conf.api,
        ni: ''
      }
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),
      
      clearAll() { this.ni = ''},
      async addNewOutput() {
        if (this.ni.trim() != '') {
          this.loadOn()
          try {
            let res = await Http.request({
              url: `${this.api}/outputs`,
              method: 'POST',
              headers: { 'Content-Type': 'application/json'},
              content: JSON.stringify({
                REFERENCIA: this.ni
              })
            })

            alert('Salida Creada')
            this.parent.fillOutputs()
            this.$navigateBack()

          } catch (error) { 
            alert(error)
            this.clearAll()
          }
          this.loadOff()
        } else {
          alert('Rellene el campo de Número Interno')
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../app-variables';
  // End custom common variables

  // Custom styles
  .fa {
      color: $accent-dark;
  }

  .accent-bg {
    background: $accent-dark;
  }

  .scc-yellow {
    color: $scc-yellow;
  }

  .info {
      font-size: 20;
  }

  .t-uppercase {
    text-transform: uppercase;
  }
</style>

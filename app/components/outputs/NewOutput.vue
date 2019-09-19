<template>
  <Page>
    <ActionBar title="Nueva Salida" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="busy" @busyChange="" />
      <Label text="Nueva Salida: " fontSize="30" class="fa" />
      <TextField v-model="ni" hint="Número Interno" @textChange="" @returnPress="addNewOutput" keyboardType="text" height="50" class="t-uppercase" />
      <Button text="Crear Salida" @tap="addNewOutput" />
    </StackLayout>
  </Page>
</template>

<script>
  import axios from 'axios'
  import conf from '../../customconfig.json'

  export default {
    data() {
      return {
        api: conf.api,
        busy: false,
        ni: ''
      }
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false},
      clearAll() { this.ni = ''},
      addNewOutput() {
        if (this.ni.trim() != '') {
          this.loadOn()
          axios.post(this.api+'outputs', { REFERENCIA: this.ni}).then( res => {
            alert('Salida Creada')
              .then(() => {
                this.$navigateBack()
              });
          }).catch(er => {
            alert(er)
              .then(() => {
                this.clearAll()
              });
          })
        } else {
          alert('Rellene el campo de Número Interno')
            .then(() => {
            });
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

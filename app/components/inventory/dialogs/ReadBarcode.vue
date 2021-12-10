<template>
  <Page>
    <ActionBar title="" class="action-bar" />

    <StackLayout orientation="vertical" style="padding: 10">
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Label text="Leer Codigo de barras" horizontalAlignment="center" />
      <Label horizontalAlignment="center">
        <Span class="fas bigicon" text.decode="&#xf02a;" horizontalAlignment="center "/>
      </Label>
      <TextField v-model="criteria" hint="Codigo de Barras" @returnPress="searchByCode" keyboardType="text" horizontalAlignment="center"/>
      <Button text="No Encontrado" @tap="closeDialog" style="color: #ff3030" v-if="notFound"/>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../../customconfig.json'
  import { Http } from '@nativescript/core'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        api: conf.api,
        criteria: '',
        notFound: false
      }
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

      async searchByCode() {
        this.loadOn()
        try {
          let res = await Http.getJSON(`${this.api}/buscar?barcode=${this.criteria}`)

          if (res.length > 0) {
              if (res.length > 1) {
                alert('Existen varios repuestos con este codigo')
                this.$modal.close()
              } else if (res.length == 1) {
                this.$modal.close(res[0].ARTICULO)
              }
            } else {
              this.notFound = true
            }
        } catch (error) { alert(error) }
        this.loadOff()
        // axios.get(this.apiUrl+'search/articuloscodigo', {
        //   params: {
        //     criteria: this.criteria
        //   }
        // }).then(res => {
        //   if (res.data.length > 0) {
        //     if (res.data.length > 1) {
        //       alert('Existen varios repuestos con este codigo')
        //       this.$modal.close()
        //     } else {
        //       this.$modal.close(res.data[0].ARTICULO)
        //     }
        //   } else {
        //     this.notFound = true
        //     this.loadOff()
        //   }
        // }).catch(er => { alert(er) })
      },
      closeDialog() {
        this.$modal.close()
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../../app-variables';
  // End custom common variables

  // Custom styles
  .fas {
      color: $accent-dark;
  }

  .desc {
    font-size: 16;
    color: #747474;
  }

  .info {
      font-size: 20;
  }

  .bigicon {
    font-size: 200;
  }
</style>

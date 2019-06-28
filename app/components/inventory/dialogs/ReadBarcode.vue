<template>
  <Page>
    <ActionBar title="" class="action-bar" />

    <StackLayout orientation="vertical" style="padding: 10">
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <Label text="Leer Codigo de barras" horizontalAlignment="center" />
      <Label horizontalAlignment="center">
        <Span class="fas bigicon" text.decode="&#xf02a;" horizontalAlignment="center "/>
      </Label>
      <TextField v-model="criteria" hint="Codigo de Barras" @textChange="" @returnPress="searchByCode" keyboardType="text" horizontalAlignment="center"/>
      <Button text="No Encontrado" @tap="closeDialog" style="color: #ff3030" v-show="notFound"/>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../../customconfig.json'
  import axios from 'axios'

  export default {
    data() {
      return {
        apiUrl: conf.api,
        busy: false,
        criteria: '',
        notFound: false
      }
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      searchByCode() {
        this.loadOn()
        axios.get(this.apiUrl+'search/articuloscodigo', {
          params: {
            criteria: this.criteria
          }
        }).then(res => {
          if (res.data.length > 0) {
            if (res.data.length > 1) {
              alert('Existen varios repuestos con este codigo')
              this.$modal.close()
            } else {
              this.$modal.close(res.data[0].ARTICULO)
            }
          } else {
            this.notFound = true
            this.loadOff()
          }
        }).catch(er => { alert(er) })
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

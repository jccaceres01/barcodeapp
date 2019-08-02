<template>
  <Page class="page">
    <ActionBar class="action-bar" title="Consulta">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="busy" @busyChange="" />
      <Label text="Existencias Repuesto: " class="fa" fontSize="20" />
      <Label :text="item.DESCRIPCION" class="fa" fontSize="13" />
      <Button text="Cerrar" @tap="$modal.close()" />
      <ScrollView orientation="vertical" width="99%" height="99%">
        <ListView class="list-group" for="n in stockLote" @itemTap="" separatorColor="white">
            <v-template let-country="item">
                <GridLayout rows="* auto" columns="*" class="list-group-item active" style="border:1;">
                    <!-- <Image row="0" col="0" src="https://www.ssbwiki.com/images/thumb/5/56/Toon_Link_SSBU.png/250px-Toon_Link_SSBU.png"></Image> -->
                    <StackLayout row="1" col="0" backgroundColor="white" class="list-group-item">
                        <Label class="list-group-item-heading" text="Bodega: "></Label>
                        <Label class="list-group-item-text" :text="n.BODEGA"></Label>
                        <Label class="list-group-item-heading" text="Localización: "></Label>
                        <Label class="list-group-item-text" :text="n.LOCALIZACION"></Label>
                        <Label class="list-group-item-heading" text="Disponible: "></Label>
                        <Label class="list-group-item-text" :text="n.CANT_DISPONIBLE"></Label>
                        <Label class="list-group-item-heading" text="Reservada: "></Label>
                        <Label class="list-group-item-text" :text="n.CANT_RESERVADA"></Label>
                    </StackLayout>
                </GridLayout>
            </v-template>
        </ListView>
      </ScrollView>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import axios from 'axios'

  export default {
    data() {
      return {
        api: conf.api,
        busy: false,
        stockLote: []
      }
    },
    created() {
      this.fillStockLote()
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      fillStockLote() {
        this.loadOn()
        axios.get(this.api+'stock/lote', {
          params: {articulo: this.item.ARTICULO}
        }).then(res => {
          this.stockLote = res.data
          this.loadOff()
        }).catch( er => {
          alert(er)
          this.loadOff()
        })
      }
    },
    props: ['item']
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

  .info {
      font-size: 20;
  }

  .t-uppercase {
    text-transform: uppercase;
  }
</style>

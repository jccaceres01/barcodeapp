<template>
  <Page>
    <ActionBar title="Codigo de Barras" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <ActionItem @tap="clearAll"
        ios.systemIcon="13" ios.position="right"
        android.systemIcon="ic_menu_refresh"
        android.position="right" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="busy" @busyChange="" width="30" height="30" />
      <SearchBar hint="Buscar Repuesto" v-model="searchCriteria" @textChange="" @submit="fintItems" v-show="!hasItemSelected" width="*" height="50" />
      <ScrollView orientation="vertical" height="250" v-show="hasItems">
      </ScrollView>
      <StackLayout orientation="vartical" v-show="hasItemSelected">
        <Label>
          <Span text="Repuesto: " class="fa" />
          <Span :text="itemSelected.DESCRIPCION" class="desc" />
        </Label>
        <Label>
          <Span text="Cod. Softland: " class="fa" />
          <Span :text="itemSelected.ARTICULO" class="desc" />
        </Label>
        <Label>
          <Span text="Cód. Barras: " class="fa" />
          <Span :text="itemSelected.CODIGO_BARRAS_INVT" class="desc" />
        </Label>
        <TextField v-model="barcode_input" hint="Asignar Código de Barras" keyboardType="text" @returnPress="placeBarcode" />
        <StackLayout orientation="horizontal">
          <Button text="Limpiar" @tap="clearField" horizontalAlignment="center" />
          <Button text="Asignar Código" @tap="placeBarcode" horizontalAlignment="center" />
        </StackLayout>
      </StackLayout>
    </StackLayout>
  </Page>

</template>

<script>
  import axios from 'axios'
  import BarcodeItemSelect from './BarcodeItemSelect'
  import conf from '../../customconfig.json'

  export default {
    computed: {
      hasItemSelected() {
        return (this.itemSelected.articulo != '')
      }
    },
    created() {
    },
    data() {
      return {
        api: conf.api,
        itemSelect: BarcodeItemSelect,
        busy: false,
        searchCriteria: '',
        barcode_input: '',
        itemSelected: {
          articulo: '',
          descripcion: '',
          codigo_barras_vent: '',
          codigo_barras_invt: ''
        }
      }
    },
    methods: {
      loadOn() {
        this.busy = true
      },
      loadOff() {
        this.busy = false
      },
      clearAll() {
        this.loadOff()
        this.barcode_input = ''
        this.itemSelected = {
          articulo: '',
          descripcion: '',
          codigo_barras_vent: '',
          codigo_barras_invt: ''
        }
        this.searchCriteria = ''
      },
      fintItems() {
        if (this.searchCriteria.trim() != ''){
          this.$showModal(this.itemSelect, {fullscreen: true, props: {criteria: this.searchCriteria}}).then(res => {
            this.itemSelected = res
          }).catch(er => {
            alert(er)
              .then(() => {
              });
          })
        } else {
          alert('Rellene el campo de busqueda')
            .then(() => {

            });
        }
      },
      placeBarcode() {
        if (this.barcode_input.trim() != '') {
          this.loadOn()
          axios.put(this.api+'articulos/'+this.itemSelected.ARTICULO, {
              CODIGO_BARRAS_INVT: this.barcode_input,
              CODIGO_BARRAS_VENT: this.barcode_input
          }).then(res => {
            alert('Código de Barras Asignado')
              .then(() => {
                this.clearAll()
              });
          }).catch(er => {
            alert(er)
              .then(() => {
                this.clearAll()
              });
          })
        } else {
          alert('No puede dejar el codigo de barras vacio')
            .then(() => {
            });
        }
      },
      clearField() {
        this.barcode_input = ''
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

  .desc {
    font-size: 16;
    color: #747474;
  }

  .info {
      font-size: 20;
  }
</style>

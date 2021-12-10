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
      <ActivityIndicator :busy="$store.state.loading" width="30" height="30" v-show="$store.state.loading" />
      <SearchBar hint="Buscar Repuesto" v-model="searchCriteria" @submit="fintItems" v-show="!hasItemSelected" width="*" height="50" />
      <!-- Result List -->
      <ListView for="(item, index) in resultList" height="100%"  v-show="(resultList.length > 0)">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <!-- Black Bar -->
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" class="p-b-10">
                  <FormattedString>
                    <Span :text="item.ARTICULO" style="color: #1b1b1b" fontSize="25" />
                    <Span text="(" fontSize="18" />
                    <Span :text="item.DESCRIPCION" fontSize="18" />
                    <Span text=")" fontSize="18" />
                  </FormattedString>
                </Label>
                <FlexboxLayout flexDirection="row">
                  <StackLayout orientation="verticla" width="50%">
                    <Label text="Cod. Barras Venta: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.CODIGO_BARRAS_VENT" textWrap="true" fontSize="10" />
                    <Label text="Original: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label v-if="(item.CLASIFICACION_2 == '02-01')">
                      <FormattedString>
                        <Span class="fas" text.decode="&#xf058;"/>
                      </FormattedString>
                    </Label>
                    <Label v-else>
                      <FormattedString>
                        <Span class="fas" text.decode="&#xf057;"/>
                      </FormattedString>
                    </Label>
                  </StackLayout>
                  <StackLayout orientation="verticla" width="50%">
                    <Label text="Cod Barras Inventario: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.CODIGO_BARRAS_INVT" textWrap="true" fontSize="10" />
                    <Button text="Escanear Código" @tap="readBarcode(item, index)" textWrap="true" class="p-r-5" />
                  </StackLayout>
                </FlexboxLayout>
              </StackLayout>
            </FlexboxLayout>
          </StackLayout>
        </v-template>
      </ListView>

      <!-- Item selected -->
      <StackLayout orientation="vartical" v-show="hasItemSelected">
        <Label textWrap="true" varticalAlignment="center" horizontalAlignment="center" fontSize="14">
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
  import conf from '../../customconfig.json'
  import PickBarcodeComponent from '../syncOffline/dialogs/PickBarcodeComponent'
  import { mapActions } from 'vuex'
  import { Http } from '@nativescript/core'

  export default {
    computed: {
      hasItemSelected() {
        return (this.itemSelected.articulo != '')
      },
      hasResults() {
        return (this.resultList.length > 0)
      }
    },
    created() {
    },
    data() {
      return {
        api: conf.api,
        searchCriteria: '',
        resultList: [],
        barcode_input: '',
        pickBarcodeComponent: PickBarcodeComponent,
        itemSelected: {
          articulo: '',
          descripcion: '',
          codigo_barras_vent: '',
          codigo_barras_invt: ''
        }
      }
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),
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
      async fintItems() {
        if (this.searchCriteria.trim() != '') {
          this.loadOn()
          try {
            let res = await Http.getJSON(`${this.api}/search/articulos?criteria=${this.searchCriteria}`)
            this.resultList = res
          } catch (er) {
            alert(er)
          }

          this.loadOff()
        } else {
          alert('Ingrese un valor en el campo de busqueda')
        }
      },
      async readBarcode(item, index) {
        let modalValue = await this.$showModal(this.pickBarcodeComponent)

        if (modalValue.trim() !== '') {
          item.CODIGO_BARRAS_VENT = modalValue
          item.CODIGO_BARRAS_INVT = modalValue

          this.loadOn()

          try {
            let res = await Http.request({
              url: `${this.api}/articulos/${item.ARTICULO}`,
              method: 'PUT',
              headers: {'Content-Type': 'Application/json'},
              content: JSON.stringify({
                'CODIGO_BARRAS_VENT': item.CODIGO_BARRAS_VENT,
                'CODIGO_BARRAS_INVT': item.CODIGO_BARRAS_INVT
              })
            })
            alert('Código de Barras Agregado')
          } catch (er) {
            alert(er)
          }

          this.loadOff()
        } else {
          alert('No se escaneo ningun código')
        }
      }
    },
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

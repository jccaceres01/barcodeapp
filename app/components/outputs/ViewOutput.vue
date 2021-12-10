<template>
  <Page>
    <ActionBar :title="output.DOCUMENTO_INV" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>
    <StackLayout>
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <TabView :selectedIndex="tabSelectedIndex" @selectedIndexChange="changeIndex">
        <!-- Output Detail -->
        <TabViewItem title="Detalle">
          <StackLayout orientation="vertical" padding="10">
            <Label textWrap="true">
              <FormattedString>
                <Span class="fa" text.decode="&#xf111; "/>
                <Span text="Documento: " class="fa" fontSize="25" />
                <Span :text="output.DOCUMENTO_INV" style="font-size:20; color:#7c7c7c" />
              </FormattedString>
            </Label>
            <Label textWrap="true">
              <FormattedString>
                <Span class="fa" text.decode="&#xf111; "/>
                <Span text="Referencia: " class="fa" fontSize="25" />
                <Span :text="output.REFERENCIA" style="font-size:20; color:#7c7c7c" />
              </FormattedString>
            </Label>
            <Label textWrap="true">
              <FormattedString>
                <Span class="fa" text.decode="&#xf111; "/>
                <Span text="Fecha: " class="fa" fontSize="25" />
                <Span :text="output.FECHA_HOR_CREACION" style="font-size:20; color:#7c7c7c" />
              </FormattedString>
            </Label>
            <Label textWrap="true">
              <FormattedString>
                <Span class="fa" text.decode="&#xf111; "/>
                <Span text="Usuario: " class="fa" fontSize="25" />
                <Span :text="output.USUARIO" style="font-size:20; color:#7c7c7c" />
              </FormattedString>
            </Label>
          </StackLayout>
        </TabViewItem>
        <!-- Lines Tab -->
        <TabViewItem title="Lineas">
          <GridLayout padding="10">
            <ListView for="item, in lines" >
              <v-template>
                <GridLayout columns="auto, *, auto" rows="auto, auto">
                  <Label class="accent-bg scc-yellow" verticalAlignment="center" horizontalAlignment="center" fontSize="30" col="0" row="0" :text="item.LINEA_DOC_INV" width="80" height="80" margin="3" />
                  <StackLayout orientation="vertical" col="1" row="0">
                    <Label textWrap="true">
                      <FormattedString>
                        <Span text="Repuesto: " style="font-size:18;" class="fa" />
                        <Span :text="item.DESCRIPCION" style="color:#8a8a8a; font-size:13" />
                      </FormattedString>
                    </Label>
                    <Label textWrap="true">
                      <FormattedString>
                        <Span text="Cod.Softland: " style="font-size:18;" class="fa" />
                        <Span :text="item.ARTICULO" style="color:#8a8a8a; font-size:13" />
                      </FormattedString>
                    </Label>
                    <Label textWrap="true">
                      <FormattedString>
                        <Span text="Localización: " style="font-size:18;" class="fa" />
                        <Span :text="item.LOCALIZACION" style="color:#8a8a8a; font-size:13" />
                      </FormattedString>
                    </Label>
                    <Label textWrap="true">
                      <FormattedString>
                        <Span text="Cantidad: " style="font-size:18;" class="fa" />
                        <Span :text="item.CANTIDAD" style="color:#8a8a8a; font-size:13" />
                      </FormattedString>
                    </Label>
                    <Button text="text" @tap="deleteLine(item)">
                      <Span class="fa" text.decode="&#xf1f8;" />
                    </Button>
                  </StackLayout>
                </GridLayout>
              </v-template>
            </ListView>
          </GridLayout>
        </TabViewItem>
        <!-- New Line Tab -->
        <TabViewItem title="Nueva Linea">
          <ScrollView orientation="vertical" width="99%" height="99%">
            <StackLayout orientation="vertical" padding="10">
              <StackLayout orientation="horizontal" width="*" height="50">
                <TextField :text="selectedCostCenter.value" hint="Centro de Costo" textWrap="true" width="80%" editable="false" />
                <Button @tap="selectCostCenter" width="20%" id="ccbtn">
                  <Span class="fa" text.decode="&#xf13a; "/>
                </Button>
              </StackLayout>
              <StackLayout orientation="horizontal" width="*" height="50">
                <TextField :text="selectedStorage.BODEGA" hint="Bodega" textWrap="true" width="80%" editable="false" />
                <Button @tap="selectStorage" width="20%">
                  <Span class="fas" text.decode="&#xf13a;"/>
                </Button>
              </StackLayout>
              <StackLayout orientation="horizontal" width="*" height="50">
                <TextField :text="selectedLocation.LOCALIZACION" hint="Localización" textWrap="true" width="80%" editable="false" />
                <Button @tap="selectLocation" width="20%">
                  <Span class="fas" text.decode="&#xf13a;"/>
                </Button>
              </StackLayout>
              <StackLayout orientation="horizontal" width="*" height="50">
                <Label text="Habilitar Cantidades: " fontSize="20" class="fa" />
                <Switch @checkedChange="onCheckedChange" v-model="enableQuantity" />
              </StackLayout>
              <TextField hint="Cantidad" keyboardType="text" :editable="enableQuantity" v-model="quantity" />
              <SearchBar hint="Buscar Codigo de Barras" v-model="barcodeCriteria" @submit="getItem" />
              <TextField v-model="itemId" hint="Código Softland" keyboardType="text" editable="false" />
              <Button text="Agregar Linea" @tap="addLine">
                <Span class="fa" text.decode="&#xf0c7; "/>
              </Button>
            </StackLayout>
          </ScrollView>
        </TabViewItem>
      </TabView>
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import { mapActions } from 'vuex'
  import { Http } from '@nativescript/core'
  import CostCenter from './OutputsDialogs/CostCenter'
  import StorageSelect from './OutputsDialogs/StorageSelect'
  import LocationSelect from './OutputsDialogs/LocationSelect'

  export default {
    data() {
      return {
        // Configs
        api: conf.api,
        // Components
        costCenter: CostCenter,
        storageSelect: StorageSelect,
        locationSelect: LocationSelect,
        // Data
        tabSelectedIndex: 0,
        barcodeCriteria: '',
        itemId: '',
        warehouses: [],
        lines: [],
        selectedCostCenter: {id: '', value: ''},
        selectedStorage: {BODEGA: '', NOMBRE: ''},
        selectedLocation: {BODEGA: '', LOCALIZACION: '', DESCRIPCION: ''},
        quantity: 1,
        enableQuantity: false
      }
    },
    created() {
      this.fillWarehouses()
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),
      
      async fillWarehouses() {
        this.loadOn()
        try {
          let res = await Http.getJSON(`${this.api}/bodega`)

          res.forEach(cb => {
            this.warehouses.push({
              BODEGA: cb.BODEGA,
              NOMBRE: cb.NOMBRE,
              toString: () => {
                return '('+cb.BODEGA+') '+cb.NOMBRE
              }
            })
          })
        } catch (er) { alert(er) }
        this.loadOff()
      },
      async deleteLine(item) {
        let con = await confirm('¿Desea borrar esta linea?')
        if (con) {
          this.loadOn()
          try {
            let res = await Http.request({
              url: `${this.api}/outputlines?documento_inv=${this.output.DOCUMENTO_INV}&articulo=${item.ARTICULO}&bodega=${item.BODEGA}&localizacion=${item.LOCALIZACION}&linea=${item.LINEA_DOC_INV}&cantidad=${item.CANTIDAD}`,
              method: 'delete',
              headers: { 'Content-Type': 'application/json'},
            })

            switch (res.content.toJSON()) {
              case 'noExistsLote':
                alert('No se encontro el lote de la existencia')
                break;
              case 'noExistsBodega':
                alert('No se encontro la existencia en bodega')
                break;
              case 'noExistsReserva':
                alert('No se encontro la existencia en reserva')
                break;
              case 'lineDroped':
                alert('Linea Borrada')
                break;
              default:
                alert('Noting')
                break;
            }
            this.fillOutputLines()

          } catch(er) { alert(er) }
          this.loadOff()
        }
      },
      clearAll() {
        this.lines = []
        this.tabSelectedIndex = 0
      },
      clearHalfForm() {
        this.quantity = 1
        this.barcodeCriteria = ''
        this.enableQuantity = false
        this.itemId = ''
        this.loadOff()
      },
      onCheckedChange() {
        if (this.enableQuantity === false) {
          this.quantity = 1
        }
      },
      async fillOutputLines() {
        try {
          let res = await Http.getJSON(`${this.api}/outputlines/${this.output.DOCUMENTO_INV}`)
          this.lines = []
          this.lines = res

        } catch (er) { 
          alert(er)
          this.clearAll()
        }

        this.loadOff()
      },
      changeIndex(index) {
        switch (index.value) {
          case 0:
            break;
          case 1:
            this.fillOutputLines()
            break;
          case 2:
            break;
          default:
            alert('Error en el valor devuelto por el indice de pestaña')
            .then(() => {
              this.clearAll()
            })
        }
      },
      selectCostCenter() {
        this.$showModal(this.costCenter, {fullscreen: true}).then(res => {
          if (res) {
            this.selectedCostCenter = res
          } else {
            alert('No se ha seleccionado ningun centro de costo')
          }
        })
      },
      async selectStorage() {
        let storageSelection = await this.$showModal(this.storageSelect, 
          {fullscreen: true})
        
        if (storageSelection) {
          this.selectedStorage = storageSelection
          this.fillLocations(storageSelection)
        } else {
          alert('No se ha seleccionado ninguna bodega.')
        }
      },
      async selectLocation() {
        let loc = await this.$showModal(this.locationSelect, 
          {fullscreen: true, props: {storage: this.selectedStorage.BODEGA}})
        if (loc) {
          this.selectedLocation = loc
        } else { alert('No se selecciono una localización') }
      },
      async getItem() {
        if (this.barcodeCriteria !== '') {
          try {
            this.loadOn()
            let res = await Http.getJSON(`${this.api}/buscar?barcode=${this.barcodeCriteria}`)
            if (res) {
              if (res.length > 1) {
                alert('Existen varios articulos con este código de barras')
                this.barcodeCriteria = ''
              } else if (res.length == 1) {
                this.itemId = res[0].ARTICULO
                this.addLine()
              } else if (res.length <= 0) {
                alert('Repuesto no encontrado')
              }
            } else { alert('Respuesto no encontrado') }
            this.loadOff()
          } catch (error) { alert(error) }
        } else {
          alert('Debe rellenar el campo de busqueda con el código de barras')
        }
      },
      async addLine() {
        if (
          this.selectStorage.BODEGA !== '' &&
          this.selectedCostCenter.value !== '' &&
          this.selectedLocation.LOCALIZACION !== '' &&
          this.itemId !== ''
        ) {
          this.loadOn()
          try {
            let res = await Http.request({
              url: `${this.api}/outputline?documento_inv=${this.output.DOCUMENTO_INV}&bodega=${this.selectedStorage.BODEGA}&localizacion=${this.selectedLocation.LOCALIZACION}&centro_costo=${this.selectedCostCenter.id}&cantidad=${this.quantity}&articulo=${this.itemId}`,
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            })

            switch (res.content.toJSON()) {
              case 'inserted':
                alert('Linea Agregada')
                break;
              case 'exceeded':
                alert('No hay existencia suficiente en lote')
                break;
              case 'noExistsLote' :
                alert('No se encontro el respuesto en lote (\"Localización\")')
                break;
              case 'noExistsBodega':
                alert('No hay existencia en bodega')
                break;
              default:
                break;
            }
            this.clearHalfForm()
          } catch (error) {
            alert(error)
            this.clearHalfForm()
          }
          this.loadOff()
        } else {
          alert('No puede dejar campos vacios')
        }
      }
    },
    props: ['output']
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
</style>

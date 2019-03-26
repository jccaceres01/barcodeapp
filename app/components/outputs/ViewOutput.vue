<template>
  <Page>
    <ActionBar :title="output.DOCUMENTO_INV" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>
    <GridLayout>
      <ActivityIndicator :busy="busy" />
      <TabView :selectedIndex="tabSelectedIndex" @selectedIndexChange="changeIndex">
        <!-- Output Detail -->
        <TabViewItem title="Detalle">
          <StackLayout orientation="vertical">
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
          <GridLayout>
            <ListView for="item, in lines" @itemTap="">
              <v-template>
                <GridLayout columns="auto, *, auto" rows="auto, auto">
                  <Label backgroundColor="#3A53FF" verticalAlignment="center" horizontalAlignment="center" fontSize="30" col="0" row="0" :text="item.LINEA_DOC_INV" width="80" height="80" margin="3" color="#ffffff" />
                  <StackLayout orientation="vertical" col="1" row="0">
                    <Label textWrap="true">
                      <FormattedString>
                        <Span text="Repuesto: " style="font-size:18; color:#024dbe " />
                        <Span :text="item.DESCRIPCION" style="color:#8a8a8a; font-size:13" />
                      </FormattedString>
                    </Label>
                    <Label textWrap="true">
                      <FormattedString>
                        <Span text="Cod.Softland: " style="font-size:18; color:#024dbe " />
                        <Span :text="item.ARTICULO" style="color:#8a8a8a; font-size:13" />
                      </FormattedString>
                    </Label>
                    <Label textWrap="true">
                      <FormattedString>
                        <Span text="Localización: " style="font-size:18; color:#024dbe " />
                        <Span :text="item.LOCALIZACION" style="color:#8a8a8a; font-size:13" />
                      </FormattedString>
                    </Label>
                    <Label textWrap="true">
                      <FormattedString>
                        <Span text="Cantidad: " style="font-size:18; color:#024dbe " />
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
            <StackLayout orientation="vertical">
              <Label text="Centro de Costo: " fontSize="20" color="#3A53FF" />
              <StackLayout orientation="horizontal" width="*" height="40">
                <TextField :text="selectedCostCenter.value" textWrap="true" width="60%" editable="false" />
                <Button text="Seleccionar" @tap="selectCostCenter" width="40%" id="ccbtn" />
              </StackLayout>
              <Label text="Bodega: " fontSize="20" color="#3A53FF" />
              <StackLayout orientation="horizontal" width="*" height="40">
                <TextField :text="selectedStorage.BODEGA" textWrap="true" width="60%" editable="false" />
                <Button text="Seleccionar" @tap="selectStorage" width="40%" />
              </StackLayout>
              <Label text="Localización: " fontSize="20" color="#3A53FF" />
              <StackLayout orientation="horizontal" width="*" height="40">
                <TextField :text="selectedLocation.LOCALIZACION" textWrap="true" width="60%" editable="false" />
                <Button text="Seleccionar" @tap="selectLocation" width="40%" />
              </StackLayout>
              <StackLayout orientation="horizontal" width="*" height="40">
                <Label text="Habilitar Cantidades: " fontSize="20" color="#3A53FF" />
                <Switch v-model="enableQuantity" @checkedChange="onCheckedChange" />
              </StackLayout>
              <TextField v-model="quantity" hint="Cantidad" @textChange="" @returnPress="" keyboardType="number" :editable="enableQuantity"/>
              <SearchBar hint="Buscar Codigo de Barras" v-model="barcodeCriteria" @textChange="" @submit="getItem" />
              <TextField v-model="itemId" hint="Código Softland" @textChange="onTextChange" @returnPress="onReturnPress" keyboardType="text" editable="false" />
              <Button text="Agregar Linea" @tap="addLine">
                <Span class="fa" text.decode="&#xf0c7; "/>
              </Button>
            </StackLayout>
          </ScrollView>
        </TabViewItem>
      </TabView>
    </GridLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import axios from 'axios'
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
        busy: false,
        tabSelectedIndex: 0,
        barcodeCriteria: '',
        itemId: '',
        lines: [],
        locations: [],
        selectedCostCenter: {id: '', value: ''},
        selectedStorage: {BODEGA: '', NOMBRE: ''},
        selectedLocation: {BODEGA: '', LOCALIZACION: '', DESCRIPCION: ''},
        quantity: 1,
        enableQuantity: false
      }
    },
    created() {
      this.fillWarehouses()
      // document.getElementById('ccbtn').focus()
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      fillWarehouses() {
        this.loadOn()
        axios.get(this.api+'bodega').then(res => {
          this.warehouses = []
          res.data.forEach(cb => {
            this.warehouses.push({
              BODEGA: cb.BODEGA,
              NOMBRE: cb.NOMBRE,
              toString: () => {
                return '('+cb.BODEGA+') '+cb.NOMBRE
              }
            })
          })
          this.loadOff()
        }).catch(er => {
          alert(er).then(() => {
            this.clearAll()
          })
        })
      },
      deleteLine(item) {
        confirm('¿Desea borrar esta linea?')
          .then(result => {
            if (result) {
              this.loadOn()
              axios.delete(this.api+'outputlines', {
                params: {
                  documento_inv: this.output.DOCUMENTO_INV,
                  articulo: item.ARTICULO,
                  bodega: item.BODEGA,
                  localizacion: item.LOCALIZACION,
                  linea: item.LINEA_DOC_INV,
                  cantidad: item.CANTIDAD
                }
              }).then(res => {
                switch (res.data) {
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
                    break;
                }
                this.fillOutputLines()
              }).catch(er => {
                alert(er).then(() => {
                  this.clearAll()
                })
              })
            }
          });
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
        if (this.enableQuantity == false) {
          this.quantity = 1
        }
      },
      fillOutputLines() {
        this.loadOn()
        axios.get(this.api+'outputlines/'+this.output.DOCUMENTO_INV).then(res => {
          this.lines = []
          this.lines = res.data
          this.loadOff()
        }).catch(er => {
          alert(er)
            .then(() => {
              this.clearAll()
            });
        })
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
            alert('Error en el valor devuelto por el indice de pestaña').then(() => {
              this.clearAll()
            })
        }
      },
      selectCostCenter() {
        this.$showModal(this.costCenter).then(res => {
          if (res != null) {
            this.selectedCostCenter = res
          } else {
            alert('No se ha seleccionado ningun centro de costo')
          }
        })
      },
      selectStorage() {
        this.$showModal(this.storageSelect).then(res => {
          if (res != null) {
            this.selectedStorage = res
            this.loadOn()
            axios.get(this.api+'localizacion/'+this.selectedStorage.BODEGA).then(res => {
              this.locations = res.data
              this.loadOff()
            }).catch(er => {
              alert(er)
              this.clearAll()
            })
          } else {
            alert('No se ha seleccionado ninguna bodega.')
          }
        })
      },
      selectLocation() {
        this.$showModal(this.locationSelect, {props: {locations: this.locations}}).then(res => {
          if (res != null) {
            this.selectedLocation = res
          } else {
            alert('No se selecciono una localización')
          }
        })
      },
      getItem() {
        if (this.barcodeCriteria != '') {
          this.loadOn()
          axios.get(this.api+'buscar', {
            params: {
              barcode: this.barcodeCriteria
            }
          }).then(res => {
            if (res.data.length > 0) {
              if (res.data.length > 1) {
                alert('Existen varios articulos con este código de barras')
                this.barcodeCriteria = ''
              } else {
                this.itemId = res.data[0].ARTICULO
                this.addLine()
              }
            } else {
              alert('Respuesto no encontrado')
            }
          }).catch(er => {
            alert(er)
          })
          this.loadOff()
        } else {
          alert('Debe rellenar el campo de busqueda con el código de barras')
        }
      },
      addLine() {
        if (
          this.selectStorage.BODEGA != '' &&
          this.selectedCostCenter.value != '' &&
          this.selectedLocation.LOCALIZACION != '' &&
          this.itemId != ''
        ) {
          this.loadOn()
          axios.post(this.api+'outputline', {
            documento_inv: this.output.DOCUMENTO_INV,
            bodega: this.selectedStorage.BODEGA,
            localizacion: this.selectedLocation.LOCALIZACION,
            centro_costo: this.selectedCostCenter.id,
            cantidad: this.quantity,
            articulo: this.itemId
          }).then(res => {
            switch (res.data) {
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
          }).catch(er => {
            alert(er)
            this.clearHalfForm()
          })
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

  .info {
      font-size: 20;
  }
</style>

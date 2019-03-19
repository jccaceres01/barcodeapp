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
        <TabViewItem title="Nueva Linea">
          <StackLayout orientation="vertical">
            <!-- Cost Center listpicker -->
            <!-- <Label text="Centro de Costo: " fontSize="20" />
            <ListPicker :items="costCenters" v-model="costCenterSelectedIndex"
              @selectedIndexChange="costCenterIndexChange" /> -->
            <!-- Warehouse listpicker -->
            <Label text="Bodega: " fontSize="20" />
            <ListPicker :items="warehouses" v-model="warehouseSelectedIndex"
              @selectedIndexChange="warehouseIndexChange" />
            <!-- locations listpicker -->
            <Label text="Localización: " fontSize="20" />
            <ListPicker :items="locations" v-model="locationSelectedIndex"
              @selectedIndexChange="locationIndexChange" />
          </StackLayout>
        </TabViewItem>
      </TabView>
    </GridLayout>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import axios from 'axios'

  export default {
    data() {
      return {
        busy: false,
        api: conf.api,
        tabSelectedIndex: 0,
        barcodeCriteria: '',
        itemId: '',
        lines: [],
        warehouses: [],
        locations: [],
        warehouseSelectedIndex: 0,
        locationSelectedIndex: 0,
        costCenters: [
          {
            id: '01-02-11',
            value: 'Pueblo Viejo (LLD-SD1  El Llagal)',
            toString: () => {
              return 'Pueblo Viejo (LLD-SD1  El Llagal)'
            }
          },
          {
            id: '01-02-13',
            value: 'Pueblo Viejo (Minería)',
            toString: () => {
              return 'Pueblo Viejo (Minería)'
            }
          },
          {
            id: '01-02-14',
            value: ' H.S.E.- PVDC',
            toString: () => {
              return ' H.S.E.- PVDC'
            }
          }
        ],
        costCenterSelectedIndex: 0,
        quantity: 1,
        enableQuantity: false
      }
    },
    created() {
      this.fillWarehouses()
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
              axios.delete(this.api+'outputlines/'+this.output.DOCUMENTO_INV+'/'+item.LINEA_DOC_INV).then(res => {
                alert('Linea Borrada!')
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
      costCenterIndexChange(event) {},
      warehouseIndexChange(event) {
        this.loadOn()
        axios.get(this.api+'localizacion/'+this.fillWarehouses[this.warehouseSelectedIndex]).then(res => {
          this.locations = []
          res.data.forEach(cb => {
            this.locations.push({LOCALIZACION: cb.LOCALIZACION})
          })
          this.loadOff()
        }).catch(er => {
          alert(er).then(() => {
            this.clearAll()
          })
        })
      },
      locationIndexChange(event) {}
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

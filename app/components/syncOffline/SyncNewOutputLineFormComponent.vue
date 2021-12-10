<template>
  <Page>
    <ActionBar title="Nueva linea" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <!-- Concurency -->
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Label textWrap="true" v-if="$store.state.loading" verticalAlignment="center" horizontalAlignment="center">
        <FormattedString>
          <Span class="fas" text.decode="&#xf06a;" />
          <Span :text="status" class="" fontSize="20" />
        </FormattedString>
      </Label>
      <!-- Form items -->
      <ScrollView orientation="vertical">
        <StackLayout orientation="vertical" style="padding: 20">
            <!-- articulo -->
            <StackLayout orientation="horizontal" width="100%">
              <TextField v-model="newLine.articulo" hint="Articulo" keyboardType="text" width="80%" editable="false"/>
              <Button @tap="pickItem" width="20%">
                <Span class="fas" text.decode="&#xf13a; "/>
              </Button>
            </StackLayout>

            <!-- bodega -->
            <StackLayout orientation="horizontal">
              <TextField :text="newLine.bodega" hint="Bodega" keyboardType="text" width="80%" editable="false" />
              <Button @tap="getWarehouse" width="20%">
                <Span class="fas" text.decode="&#xf13a; "/>
              </Button>
            </StackLayout>

            <!-- location -->
            <StackLayout orientation="horizontal">
              <TextField :text="newLine.localizacion" hint="Localizacion" keyboardType="text" width="80%" editable="false" />
              <Button @tap="getLocation" width="20%">
                <Span class="fas" text.decode="&#xf13a; "/>
              </Button>
            </StackLayout>

            <!-- Cantidad -->
            <TextField :text="newLine.cantidad" v-model="newLine.cantidad" hint="Cantidad" keyboardType="Number"/>

            <!-- Show cost center selected -->
            <Label fontSize="20" horizontalAlignment="center" verticalAlignment="center" textWrap="true" paddingBottom="10">
              <FormattedString>
                <Span text="Centro de costo Asignado" fontWeight="bold" />
                <Span text.decode="&#xa;" />
                <Span :text="salida.centro_costo" />
              </FormattedString>
            </Label>
            <!-- create new offline output -->
            <Button text="Agregar Linea" @tap="addNewLine" />
        </StackLayout>
      </ScrollView>
    </StackLayout>
  </Page>
</template>

<script>
import CostCenter from '../outputs/OutputsDialogs/Costcenter'
import PickBarcodeComponent from './dialogs/PickBarcodeComponent'
import { mapActions } from 'vuex'

import PickOfflineWarehouseComponent from
  './dialogs/PickOfflineWarehouseComponent'

import PickOfflinelocationComponent from
  './dialogs/PickOfflinelocationComponent'

import Sqlite from 'nativescript-sqlite'

export default {
  data() {
    return {
      status: '',
      criteria: '',
      newLine: {
        articulo: '',
        bodega: '',
        localizacion: '',
        cantidad: 0,
      },
      costCenter: CostCenter, // Cost center dialog
      readBarcode: PickBarcodeComponent, // Read barcode to pick item
      pickWarehouse: PickOfflineWarehouseComponent, // get Warehouse
      pickLocations: PickOfflinelocationComponent, // get Location
      readedCode: ''
    }
  },
  props: {
    salida: {type: Object},
    parent: {type: Object}
  },
  created() {
  },
  methods: {
    ...mapActions(['loadOn', 'loadOff']),

    // Pick cost center
    pickCC() {
      this.$showModal(this.costCenter).then(res => {
        this.newLine.centroCosto = res.id
      })
    },
    // Pick item (aticulo)
    pickItem() {
      this.$showModal(this.readBarcode).then(codRes => {
        if (codRes != null ) {
          if (codRes.trim() !== '') {
            // set global readedCode
            this.readedCode = codRes
            // Show concurrency
            this.loadOn()
            this.status = 'Consultando base de datos local'
            // Check if local db exists
            if (Sqlite.exists('local')) {
              // Open local db
              var promise = new Sqlite('local', er => {
                if (er) { alert(er) }
              })

              // query the item with
              promise.then(db => {

                // Set object as resutl
                db.resultType(Sqlite.RESULTSASOBJECT)
                // Perform query
                db.get('select * from articulo where codigo_barras_invt = ?',
                  [this.readedCode], (er, row) => {
                    if (!er) {
                      if (row !== null) {
                        // set articulo
                        this.newLine.articulo = row.articulo
                      } else {
                        alert('No existe código de barras')
                        this.newLine.articulo = ''
                      }
                    } else { alert(er) }
                })

                // Close connection
                db.close()
              })

              // close concurrency
              this.loadOff()
              this.status = ''

            } else { alert('No existe la base de datos local') }
          } else { alert('Debe leer un código de barras') }
        }
      })
    },
    // Pick warehouse
    getWarehouse() {
      this.$showModal(this.pickWarehouse, {fullscreen: true}).then(res => {
        if (res != null) {
          this.newLine.bodega = res
        }
      })
    },
    // get location
    getLocation() {
      if (this.newLine.bodega.trim() != '') {
        this.$showModal(this.pickLocations, { fullscreen: true, props: {bodega: this.newLine.bodega}}).then(res => {
          if (res != null) {
            this.newLine.localizacion = res
          }
        })
      } else {
        alert('Debe de seleccionar una bodega')
      }
    },
    // Add new line
    addNewLine() {
      // validate fields
      if (
        this.newLine.articulo.trim() !== '' &&
        this.newLine.bodega.trim() !== '' &&
        this.newLine.localizacion.trim() !== '' &&
        this.newLine.toString().trim() !== '' &&
        this.newLine.cantidad > 0
      ) {
        // Show concurrency
        this.loadOn()
        this.status = 'Insertando datos...'

        // Check if local db exists
        if (Sqlite.exists('local')) {
          // Open local db
          var promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })

          // insert newLine data to local db
          promise.then(db => {
            db.execSQL('insert into lineas_salida (salida_id, articulo, bodega, localizacion, cantidad, centro_costo) values (?, ?, ?, ?, ?, ?)', [this.salida.id, this.newLine.articulo, this.newLine.bodega, this.newLine.localizacion, this.newLine.cantidad, this.salida.centro_costo], (er, id) => {
              if (!er) {

              } else { alert(er) }
            })
          })

          // close connection
          promise.then(db => {
            db.close()
          })

          // hide concurrency
          this.loadOff()
          this.status = ''

          alert('Linea Agregada')
          this.parent.fillLines()
          this.$navigateBack()

        } else { alert('No existe la base de datos local') }
      } else {
        alert('Debe completar los campos')
      }
    }
  }
}
</script>

<style lang="scss" scoped >
  // Start custom common variables
  @import '../../app-variables';
  // End custom common variables

  // Custom styles
  .fa {
    color: $accent-dark;
  }

  .fas {
    color: $accent-dark;
  }

  .info {
    font-size: 20;
  }

  .mediumicon {
    font-size: 30;
  }

  .bigicon {
    font-size: 100;
  }
</style>

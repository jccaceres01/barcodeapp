<template>
  <Page>
    <ActionBar title="Salidas Sin Conexión" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <ActionItem @tap="fillOutputs"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_refresh" />
      <ActionItem @tap="newOutput"
        text="Nueva Salida"
        ios.systemIcon="" ios.position="right"
        android.systemIcon="ic_menu_add"
        android.position="popup" />
      <ActionItem @tap="ViewLog"
        text="Registro de Subida"
        ios.systemIcon="" ios.position="right"
        android.systemIcon=""
        android.position="popup" />
      <!-- Delete upload log -->
      <ActionItem @tap="dropLog"
        text="Borrar Registro de Subidas"
        ios.systemIcon="" ios.position="right"
        android.systemIcon=""
        android.position="popup" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <!-- Concurency -->
      <ActivityIndicator :busy="$store.state.loading" v-show="$store.state.loading" />
      <Label textWrap="true" v-show="$store.state.loading" verticalAlignment="center" horizontalAlignment="center">
        <FormattedString>
          <Span class="fas" text.decode="&#xf06a;" />
          <Span :text="status" class="" fontSize="20" />
        </FormattedString>
      </Label>
      <!-- Searchbox to filter list -->
      <SearchBar hint="filtrar Salidas por referencia" v-model="criteria" v-show="(this.outputs.length > 0)" />
      <Label text="No hay salidas" fontSize="20" horizontalAlignment="center" verticalAlignment="center" v-show="!(this.outputs.length > 0)" padding="10" />
      <!-- List of items to sync with server -->
      <ListView for="(item, index) in filtered" @itemTap="showLines(item, index)" height="100%" @onLongPress="removeItem(item, index)">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <!-- Black Bar -->
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" paddingBottom="2" verticalAlignment="center" horizontalAlignment="center" style="boder-bottom-style:solid; border-bottom-color: #262626; border-bottom-width:4px">
                  <FormattedString>
                    <Span text="Salida Local No.: " style="color: #404040" fontSize="24"/>
                    <Span :text="item.id.toString().padStart(6, '0')" style="color: #7e7e7e" fontSize="22" />
                  </FormattedString>
                </Label>
                <FlexboxLayout flexDirection="row">
                  <StackLayout orientation="vertical" width="50%">
                    <Label text="Referencia: " style="color: #404040" fontSize="16" fontWeight="bold" />
                    <Label :text="item.referencia" style="color: #7e7e7e" fontSize="14" textWrap="true" />
                  </StackLayout>
                  <StackLayout orientation="vertical" width="50%">
                    <Label text="Centro de Costo: " style="color: #404040" fontSize="16" fontWeight="bold"/>
                    <Label :text="item.centro_costo" style="color: #7e7e7e" fontSize="14" textWrap="true" />
                  </StackLayout>
                </FlexboxLayout>
                <FlexboxLayout flexDirection="row" paddingLeft="2" paddingRight="2" >
                  <Button text="" @tap="removeItem(item, index)" width="33.33%">
                    <FormattedString>
                      <Span class="fas" text.decode="&#xf2ed;" />
                    </FormattedString>
                  </Button>
                  <Button text="" @tap="showLines(item, index)" width="33.33%">
                    <FormattedString>
                      <Span class="fas" text.decode="&#xf06e;" />
                    </FormattedString>
                  </Button>
                  <Button text="" @tap="uploadOfflineoutputs(item, index)" width="33.33%">
                    <FormattedString>
                      <Span class="fas" text.decode="&#xf382;" />
                    </FormattedString>
                  </Button>
                </FlexboxLayout>
              </StackLayout>
            </FlexboxLayout>
          </StackLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  import { Http, HttpResponse } from '@nativescript/core'
  import Sqlite from 'nativescript-sqlite'
  import conf from '../../customconfig.json'
  import * as AppSettings from '@nativescript/core/application-settings'
  import SyncNewOutputLineComponent from './SyncNewOutputLineComponent'
  import PickOutputReferenceController from './dialogs/PickOutputReferenceController'
  import LoggerUI from '../utilities/LoggerUI'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        api: conf.api,
        criteria: '',
        status: '',
        appSettings: AppSettings,
        newLine: SyncNewOutputLineComponent,
        pickReferences: PickOutputReferenceController, // Pick referecen and cost center for output
        logView: LoggerUI,
        outputs: [],
        output: null
      }
    },
    created() {
      this.fillOutputs()
      this.initLog()
    },
    computed: {
      filtered() {
        return this.outputs.filter(cb => {
          return (cb.referencia.trim().toLowerCase()
            .indexOf(this.criteria.trim().toLowerCase()) !== -1) ||
            (cb.referencia.trim().toLowerCase().padStart(6, '0')
              .indexOf(this.criteria.trim().toLowerCase()) !== -1)
        })
      }
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

      resetUploadEr() { this.uploadEr = false },
      // Init uploadLog
      initLog() {
        if (!this.appSettings.hasKey('uploadLog')) {
          this.appSettings.setString('uploadLog', '')
        }
      },
      // Upload scanned outputs
      async uploadOfflineoutputs(item, index) {
        // Ask if continue uploading
        var perform = await confirm('Subir Salida?')
        if (!perform) { return 0 }

        // Init concurrency
        this.loadOn()
        this.status = 'Subiendo Salida'
        // Try upload output and store
        let output = await this.uploadOutput(item.referencia)
        // Get Local output lines
        let lines = await this.getLocalOutputLines(item.id)
        // Declare lineUpEr
        let lineUpEr = false

        if (output.statusCode == 200 && lines.length > 0) {
          // Insert local lines into new output upploaded

          for (var i = 0; i < lines.length; i++) {
            let res = await Http.request({
              url: `${this.api}/outputline`,
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              content: JSON.stringify({
                documento_inv: output.content.toJSON()[0].DOCUMENTO_INV,
                articulo: lines[i].articulo,
                bodega: lines[i].bodega,
                localizacion: lines[i].localizacion,
                cantidad: lines[i].cantidad,
                centro_costo: item.centro_costo
              })
            })

            switch (res.content.toJSON()) {
              case 'inserted':
                // Log the event
                this.logLineUp('Salida local '+item.id.toString()
                  .padStart(6, '0'), 'Linea '+ (i+1) +
                  ' sincronizada a la salida: '+ output.content
                  .toJSON()[0].DOCUMENTO_INV)
                break;
              case 'noExistsLote':
                // Set lineUpEr to true
                lineUpEr = true
                // Log the event
                this.logLineUp('Salida local '+item.id.toString()
                  .padStart(6, '0'), 'Linea '+ (i+1) +
                  ' no hay existencia en lote')
                break;
              case 'noExistsBodega':
                // Set lineUpEr to true
                lineUpEr = true
                // Log the event
                this.logLineUp('Salida local '+item.id.toString()
                  .padStart(6, '0'), 'Linea '+ (i+1) +
                  ' no hay existencia en bodega')
                break;
              case 'exceeded':
                // Set lineUpEr to true
                lineUpEr = true
                // Log the event
                this.logLineUp('Salida local '+item.id.toString()
                  .padStart(6, '0'), 'Linea '+ (i+1) +
                  ' la cantidad excede la existencia en lote')
                break;
              default:
                // Set lineUpEr to true
                lineUpEr = true
                // Log the event
                this.logLineUp('Salida local '+item.id.toString()
                  .padStart(6, '0'), 'Linea '+ (i+1) +
                  ' respuesta inesperada del servidor: '+ insertedLine.data)
                break;
            }
          }

          if (lineUpEr != true) {
            this.dropUploadedOutput(item, index)
            alert('Salida sincronizada')
          } else {
            alert('La tarea se completo con errores, favor revisar el registro'+
              ' de subida')
          }

          // close concurrency
          this.loadOff()
          this.status = ''
        }
      },
      // Upload and create output
      async uploadOutput(referencia) {
        this.loadOn()
        try {
          let res = await Http.request({
            url: `${this.api}/outputs`,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            content: JSON.stringify({
              REFERENCIA: referencia
            })
          })

          return res

          // return await axios.post(this.api+'outputs', {
          //   REFERENCIA: referencia
          // })
        } catch (error) {
          alert(error)
          return null
        }
      },
      // Get local output lines
      async getLocalOutputLines(localOutputId) {
        var result = null
        if (Sqlite.exists('local')) {
          new Sqlite('local', (er, db) => {
            if (er) {
              alert(er)
            } else {
              db.resultType(Sqlite.RESULTSASOBJECT)
              db.all('select * from lineas_salida where salida_id = ?', [localOutputId], (err, res) => {
                if (!err) {
                  result = res
                } else {
                  alert(err)
                  result = null
                }
              })
            }
          })
        } else { alert('No existe base de datos local') }

        return result
      },
      // Log upload line
      logLineUp(title, body) {
        try {
          var dateTime = new Date()
          var message = '<h4>['+ dateTime.toLocaleString('es-DO') + '] - '+ title+ ': </h4>'+
            '<ul><li>'+ body +'</li></ul><br>'
          this.appSettings.setString('uploadLog', message + this.appSettings
            .getString('uploadLog'))
        } catch (e) {
          alert(e)
        }
      },
      // Delete upload err
      dropUploadedOutput(item, index) {
        if (Sqlite.exists('local')) {
          new Sqlite('local', (er, db) => {
            // Drop lines from uploaded lines
            db.execSQL('delete from lineas_salida where salida_id = ?',
              [item.id], (er, id) => {
                if (er) { alert(er) }
            })

            // Then try delete the output
            db.execSQL('delete from salidas where id = ?',
              [item.id], (er, id) => {
                if (!er) {
                  this.outputs.splice(index, 1)
                } else {
                  alert(er)
                }
            })
          })
        } else {
          alert('No hay base de datos local')
        }
      },
      // New Output
      newOutput() {
        this.$showModal(this.pickReferences, {fullscreen: true}).then(res => {
          if (res.referencia.trim() != '' &&
            res.centroCosto.id.trim() != '') {
              if (Sqlite.exists('local')) {
                var promise = new Sqlite('local', er => {
                  if (er) { alert(er) }
                })

                // Insert data in the local db
                promise.then(db => {
                  db.execSQL('insert into salidas (referencia, centro_costo)'
                    +'values (?, ?)', [res.referencia.trim(),
                    res.centroCosto.id.trim()], (er) => {
                      if (er) { alert(er) }
                  })
                })

                // Close the open connection
                promise.then(db => {
                  db.close()
                })

                // refill outputs and clear status and busy state
                this.fillOutputs()
                this.status = ''
                this.loadOff()

              } else { alert('No existe la base de datos local') }
            } else {
              alert('Debe de asignar un N.I y seleccionar un centro de costo')
            }
        })
      },
      // Fill outputs list
      fillOutputs() {
        if (Sqlite.exists('local')) {
          this.loadOn()
          this.status = 'Obteniendo salidas'
          // Create promise sqlite connection
          var promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })

          // Get the data from salidas using promise
          promise.then(db => {
            db.resultType(Sqlite.RESULTSASOBJECT)
            db.all('select * from salidas order by id', [], (er, res) => {
              if (!er) {
                this.outputs = []
                this.outputs = res
              } else { alert(er) }
            })
          })

          this.loadOff()
          this.status = ''

        } else { alert('No existe la base de datos local') }
      },
      // delete scanned outputs
      removeItem(item, index) {
        // Confirm the deletion
        confirm('Borrar esta salida?')
          .then(result => {
            if (result) {
              // Verify if the local db exists
              if (Sqlite.exists('local')) {
                // Change status and state to busy
                this.loadOn()
                this.status = 'Borrando Salida'

                // Open local connection
                var promise = new Sqlite('local', er => {
                  if (er) { alert(er) }
                })

                // Try to delete the output and its dependencies
                promise.then(db => {
                  // First try delete dependencies (outputs lines)
                  db.execSQL('delete from lineas_salida where salida_id = ?',
                    [item.id], (er, id) => {
                      if (er) { alert(er) }
                  })

                  // Then try delete the output
                  db.execSQL('delete from salidas where id = ?',
                    [item.id], (er, id) => {
                      if (er) { alert(er) }
                  })

                  // Close the connection
                  promise.then(db => {
                    db.close()
                  })

                  // remove the delete item from the listview
                  this.outputs.splice(index, 1)
                })

                // Change status and state to no busy
                this.loadOff()
                this.status = ''

              } else { alert('No existe la base de datos local') }
            }
          });
      },
      // Show Intent to view new lines
      showLines(item, index) {
        this.$navigateTo(this.newLine, { props: {salida: item}} )
      },
      // Show upload log
      ViewLog() {
        this.$navigateTo(this.logView, {props: {
          title: 'Registro de Salidas Subidas',
          log: this.appSettings.getString('uploadLog')
        }})
      },
      // Drop upload log
      dropLog() {
        confirm('Borrar Registro de Subidas?')
          .then(result => {
            if (result) {
              if (this.appSettings.hasKey('uploadLog')) {
                this.appSettings.remove('uploadLog')
                alert('Registro Borrado')
              } else { alert('No hay registro de subidas') }
            }
          });
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

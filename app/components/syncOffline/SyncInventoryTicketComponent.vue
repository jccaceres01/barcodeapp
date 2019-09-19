<template lang="html">
  <Page>
    <ActionBar title="Boletas Fuera de Linea" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack()" />
      <ActionItem @tap="refreshList"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_refresh" />
      <ActionItem @tap="viewLog"
        text="Ver registro de Subidas"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_refresh"
        android.position="popup" />
      <ActionItem @tap="deleteLog"
        text="Borrar Log"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_refresh"
        android.position="popup" />
    </ActionBar>

    <StackLayout orientation="vertical" >
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <Label :text="status"  textWrap="true" fontSize="20" color="#787878" horizontalAlignment="center" verticalAlignment="center" v-show="busy" />
      <GridLayout columns="*, *" rows="70">
        <Button @tap="newSyncInvTck" row="0" col="0">
          <FormattedString>
            <Span class="fas" text.decode="&#xf055;" fontSize="20"/>
            <Span class="fa" text.decode="&#xa; "/>
            <Span text="Nueva Boleta" style="styles" />
          </FormattedString>
        </Button>
        <Button @tap="uploadTickets" row="0" col="1">
          <FormattedString>
            <Span class="fas" text.decode="&#xf382;" fontSize="20"/>
            <Span class="fa" text.decode="&#xa; "/>
            <Span text="Subir Boletas" style="styles" />
          </FormattedString>
        </Button>
      </GridLayout>
      <!-- Filter List -->
      <SearchBar hint="Filtrar Boletas" v-model="criteria" @textChange="" @submit="" v-show="(this.tickets.length > 0)" />
      <Label text="No hay boletas" fontSize="20" color="#6c6c6c" v-show="!(this.tickets.length > 0)" verticalAlignment="center" horizontalAlignment="center" padding="10" />
      <!-- List view tickets -->
      <ListView for="(item, index) in filtered" @itemTap="pickThis" height="100%">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <!-- Black Bar -->
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" class="p-b-10">
                  <FormattedString>
                    <Span :text="item.articulo" style="color: #1b1b1b" fontSize="20" />
                    <Span text=" (" style="color: #818181" fontSize="18" />
                    <Span :text="item.descripcion" style="color: #818181" fontSize="18" />
                    <Span text=")" style="color: #818181" fontSize="18" />
                  </FormattedString>
                </Label>
                <FlexboxLayout flexDirection="row">
                  <StackLayout orientation="vertical" width="50%">
                    <Label text="Bodega: " fontSize="14" style="color: #1b1b1b" />
                    <Label :text="item.bodega" />
                    <Label text="Cantidad: " fontSize="14" style="color: #1b1b1b" />
                    <Label :text="item.cantidad" />
                  </StackLayout>
                  <StackLayout orientation="vertical" width="50%">
                    <Label text="Localización: " fontSize="14" style="color: #1b1b1b" />
                    <Label :text="item.localizacion" />
                    <Button text="text" @tap="deleteItem(item, index)">
                      <FormattedString>
                        <Span class="fas" text.decode="&#xf2ed;"/>
                      </FormattedString>
                    </Button>
                  </StackLayout>
                </FlexboxLayout>
              </StackLayout>
            </FlexboxLayout>
          </StackLayout>
        </v-template>
      </ListView>
      <Label text="Joder" />
    </StackLayout>
  </Page>
</template>

<script>
  import axios from 'axios'
  import conf from '../../customconfig.json'
  import SyncNewInventoryTicketComponent from './SyncNewInventoryTicketComponent'
  import Sqlite from 'nativescript-sqlite'
  import moment from 'moment'
  import * as ApplicatonSettings from 'application-settings'

  export default {
    data() {
      return {
        busy: false,
        api: conf.api,
        status: '',
        criteria: '',
        tickets: [],
        appSettings: ApplicatonSettings,
        syncNewInvTck: SyncNewInventoryTicketComponent
      }
    },
    computed: {
      filtered() {
        return this.tickets.filter(cb => {
          return (cb.articulo.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1) ||
            (cb.descripcion.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1)
        })
      }
    },
    mounted() {
      this.getTickets()
      this.createLog()
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      refreshList() {
        this.tickets = []
        this.getTickets()
      },
      newSyncInvTck() {
        this.$navigateTo(this.syncNewInvTck)
      },
      getTickets() {
        if (Sqlite.exists('local')) {
          this.loadOn()
          var promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })

          promise.then(db => {
            db.resultType(Sqlite.RESULTSASOBJECT)
            db.all('select * from boletas', [], (er, res) => {
              if (!er) {
                this.tickets = []
                this.tickets = res
              } else { alert(er) }
            })
          })

          this.loadOff()

        } else { alert('Adventencia: No existe la base de datos local') }
      },
      deleteItem(item, index) {
        confirm('Desea borrar esta boleta de la lista?')
          .then(result => {
            if (result) {
              if (Sqlite.exists('local')) {
                this.loadOn()
                var promise = new Sqlite('local', er => {
                  if (er) { alert(er) }
                })

                promise.then(db => {
                  db.execSQL('delete from boletas where id = ?', [item.id], er => {
                    if (!er) {
                      this.tickets.splice(index, 1)
                    } else { alert(er) }
                  })
                })

                this.loadOff()

              } else { alert('No existe base de datos local') }
            }
          });
      },
      // Upload Tickets
      async uploadTickets() {
        this.loadOn()
        this.status = 'Subiendo boletas'

        if (Sqlite.exists('local')) {
          // Sqlite db promise
          var promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })

          if (this.tickets.length > 0) {

            this.tickets.forEach(async cb => {
              try {
                var res = await axios.post(this.api+'inventory/ticket', {
                  articulo: cb.articulo,
                  bodega: cb.bodega,
                  localizacion: cb.localizacion,
                  cant: cb.cantidad,
                  fecha_descong: cb.fecha_descong
                })

                switch (res.data) {
                  case 'added':
                    this.appSettings.setString('uploadLog', '\n -['+ moment(new Date()).format('YYYY-MM-DD H:m:s')+'] Articulo: '+ cb.articulo + ' Agregado '+ this.appSettings.getString('uploadLog'))
                    promise.then(db => {
                      db.execSQL('delete from boletas where id = ?', [cb.id], (er, id) => {
                        if (er) { alert(er) }
                      })
                    })
                    break;
                  case 'exists':
                    this.appSettings.setString('uploadLog', '\n -['+ moment(new Date()).format('YYYY-MM-DD H:m:s')+'] Articulo: '+ cb.articulo + ' Existe '+ this.appSettings.getString('uploadLog'))
                    break;
                  default:
                    break;
                }
              } catch (e) {
                alert(e)
              }
            })

            this.status = 'Borrando boletas completadas de la base de datos local'

            // Show log
            action("Proceso terminado!, Desea ver el registro", "Cancelar", ['Si', 'No'])
              .then(result => {
                if (result == 'Si') {
                  alert(this.appSettings.getString('uploadLog'))
                }
              });

            this.status = ''
            this.getTickets()
            this.loadOff()

          } else {
            alert('No hay boletas para subir')
            this.loadOff()
          }
        } else { alert('No existe la base de datos local') }
      },
      // Delete uploads logs
      deleteLog() {
        confirm('Borrar registro de eventos?')
          .then(result => {
            if (result) {
              if (this.appSettings.hasKey('uploadLog')) {
                this.appSettings.remove('uploadLog')
                alert('Registro borrado!')
              } else { alert('No existe el registro') }
            }
          });
      },
      // View Log
      viewLog() {
        if (this.appSettings.hasKey('uploadLog')) {
          alert(this.appSettings.getString('uploadLog'))
        } else { alert('No existe el registro') }
      },
      //  Create uploadLog settings var
      createLog() {
        if (!this.appSettings.hasKey('uploadLog')) {
          this.appSettings.setString('uploadLog', '')
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

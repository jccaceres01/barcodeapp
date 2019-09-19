<template>
  <Page>
    <ActionBar title="Sincronizaciones" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack()" />
    </ActionBar>

    <StackLayout orientation="vertical" rows="20, *" >
      <Button text="Crear Base de datos local" @tap="createDb" :isEnabled="!busy" />
      <Button text="Borrar Base de datos local" @tap="dropDatabase" :isEnabled="!busy" />
      <Button text="Sincronizar Bodegas" @tap="syncWarehouses" :isEnabled="!busy" />
      <Button text="Sincronizar Localizaciones" @tap="syncLocations" :isEnabled="!busy" />
      <Button text="Sincronizar Repuestos" @tap="syncItems" :isEnabled="!busy" />
      <Button text="Sincronizar Existencias" @tap="syncExists" :isEnabled="!busy" />

      <ActivityIndicator :busy="busy" @busyChange="busyChangeAction" v-show="busy" />
      <Progress :value="progress" maxValue="this.paginator.last_page" @valueChange="onValueChanged" v-show="busy" />
      <Label :text="status" class="fas" fontSize="14" verticalAlignment="center" horizontalAlignment="center" v-show="busy" />
      <!-- Test items -->
      <!-- <TextField v-model="criteria" hint="Filtrar" @textChange="" @returnPress="" keyboardType="Text"/>
      <ListView for="item in filtered" @itemTap="onItemTap">
        <v-template>
          <StackLayout orientation="vertical">
          </StackLayout>
        </v-template>
      </ListView> -->
    </StackLayout>
  </Page>
</template>

<script>

  import Sqlite from 'nativescript-sqlite'
  import conf from '../../customconfig.json'
  import axios from 'axios'

  export default {
    data() {
      return {
        busy: false,
        api: conf.api,
        status: '',
        progress: 0,
        // testList: [],
        // criteria: ''
      }
    },
    mounted() {

    },
    computed: {
      filtered() {
        return this.testList.filter(cb => {
          return (cb.ARTICULO.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1)
        })
      }
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      dropDatabase() {
        confirm('Desea Borrar la DB Local?')
          .then(result => {
            if (result) {
              this.loadOn()
              this.status = 'Borrando base de datos'
              if (Sqlite.exists('local')) {
                Sqlite.deleteDatabase('local')
                alert('Base de datos borrada')
              } else { alert('No existe la base de datos local...') }
              this.loadOff()
            }
          });
      },
      createDb() {
        this.loadOn()

        if (!Sqlite.exists('local')) {
          this.status = 'Creando base de datos'
          new Sqlite('local', (er, db) => {
            if (!er) {
              db.version((er, ver) => {
                if (ver === 0) {
                  // Create table articulo
                  db.execSQL('create table if not exists articulo (articulo varchar, descripcion varchar, clasificacion_2 varchar, codigo_barras_vent varchar, codigo_barras_invt varchar)', (er) => {
                    if (!er) {
                      this.status = 'Tabla articulo, creada'
                    } else { alert(er) }
                  })
                  // Create table exists
                  db.execSQL('create table if not exists existencia_lote (bodega varchar, articulo varchar, descripcion varchar, localizacion varchar, clasificacion_2 varchar, cant_disponible integer, cant_reservada integer)', (er) => {
                    if (!er) {
                      this.status = 'Tabla existencias creada'
                    } else { alert(er) }
                  })
                  // Create table offline_escaneados
                  db.execSQL('create table if not exists escaneados (articulo varchar, descripcion varchar, codigo_barras_vent varchar, codigo_barras_invt varchar)', er => {
                    if (!er) {
                      this.status = 'Tabla escaneados creada'
                    } else { alert(er) }
                  })
                  // Create table outputs
                  db.execSQL('create table if not exists salidas (id integer primary key autoincrement, referencia varchar, centro_costo varchar)', er => {
                    if (!er) {
                      this.status = 'Tabla salidas creada'
                    } else { alert(er) }
                  })
                  // Create table output lines
                  db.execSQL('create table if not exists lineas_salida (id integer not null primary key autoincrement, salida_id integer, articulo varchar, bodega varchar, localizacion varchar, cantidad float, centro_costo varchar, foreign key(salida_id) references salidas(id))', er => {
                    if (!er) {
                      this.status = 'Tabla lineas_salida creada'
                    } else { alert(er) }
                  })
                  // Create table inventory
                  db.execSQL('create table if not exists boletas (id integer primary key autoincrement, articulo varchar, descripcion varchar, bodega varchar, localizacion varchar, cantidad float, fecha_descong date)', er => {
                    if (!er) {
                      this.status = 'Tabla boletas creada'
                    } else { alert(er) }
                  })
                  // Create table warehouses
                  db.execSQL('create table if not exists bodegas (bodega varchar, nombre varchar)', er => {
                    if (!er) {
                      this.status = 'Tabla bodegas creada'
                    } else { alert(er) }
                  })
                  // Create table locations
                  db.execSQL('create table if not exists localizaciones (bodega varchar, localizacion varchar, descripcion varchar)', er => {
                    if (!er) {
                      this.status = 'Tabla localizaciones creada'
                    } else { alert(er) }
                  })
                  // Set db version to 1
                  var newVer = ver + 1
                  db.version(newVer)
                  this.status = 'Estableciendo la version de la base de datos a: '+ newVer
                  alert('Base de datos local, creada')
                } else { alert('La base de datos existe en su version: '+ ver) }
              })
            } else { alert(er) }
          })
        } else { alert('Ya existe la base de datos local') }
        this.status = ''
        this.loadOff()
      },
      // Sync items
      async syncItems() {
        this.loadOn()
        this.status = 'Descargando datos del servidor...'

        if (Sqlite.exists('local')) {
          axios.get(this.api+'articulos').then( res => {

            this.status = 'Insertando datos en la base de datos local...'
            // Open db local
            var promise = new Sqlite('local', er => {
              if (er) { alert(er) }
            })

            // Clear table articulos
            promise.then(db => {
              db.execSQL('delete from articulo', er => {
                if (er) { alert(er) }
              })
            })

            res.data.forEach(cb => {
              promise.then(db => {
                db.execSQL('insert into articulo (articulo, descripcion, clasificacion_2, codigo_barras_vent, codigo_barras_invt) values (?, ?, ?, ?, ?)', [cb.ARTICULO, cb.DESCRIPCION, cb.CLASIFICACION_2, cb.CODIGO_BARRAS_VENT, cb.CODIGO_BARRAS_INVT], er => {
                  if (er) { alert(er) }
                })
              })
            })

            // Close db connection
            promise.then(db => {
              db.close()
            })

            this.loadOff()
            this.status = ''
          }).catch(er => { alert(er) })
        } else { alert('No existe la db local') }
      },
      // Sync Exists
      async syncExists() {
        this.loadOn()
        this.status = 'Obteniendo datos del servidor'
        var dDt = []

        axios.get(this.api+'lote').then(res => {

          this.status = 'Sincronizando datos en la base de datos local...'
          if (Sqlite.exists('local')) {
            var promise = new Sqlite('local', (er) => {
              if (er) { alert(er) }
            })

            // Drop table existencia lote before insert data
            promise.then(db => {
              db.execSQL('delete from existencia_lote')
            })

            // Loop data to insert into table
            res.data.forEach(cb => {
              promise.then(db => {
                db.execSQL('insert into existencia_lote (bodega, articulo, descripcion, localizacion, clasificacion_2, cant_disponible, cant_reservada) values (?, ?, ?, ?, ?, ?, ?)', [cb.BODEGA, cb.ARTICULO, cb.DESCRIPCION, cb.LOCALIZACION, cb.CLASIFICACION_2, cb.CANT_DISPONIBLE, cb.CANT_RESERVADA], (er, id) => {
                  if (er) { alert(er) }
                })
              })
            })
          }

          promise.then(db => { db.close()}) // Close connection before end

          this.status = ''
          this.loadOff()
        }).catch( er => {
          alert(er)
        })
      },
      // Sync Warehouses
      syncWarehouses() {
        this.loadOn()
        this.status = 'Obteniendo datos del servidor'
        var dDt = []

        axios.get(this.api+'bodega').then(res => {

          this.status = 'Sincronizando datos en la base de datos local...'
          if (Sqlite.exists('local')) {
            var promise = new Sqlite('local', (er) => {
              if (er) { alert(er) }
            })

            // Drop table existencia lote before insert data
            promise.then(db => {
              db.execSQL('delete from bodegas')
            })

            // Loop data to insert into table
            res.data.forEach(cb => {
              promise.then(db => {
                db.execSQL('insert into bodegas (bodega, nombre) values (?, ?)', [cb.BODEGA, cb.NOMBRE], (er, id) => {
                  if (er) { alert(er) }
                })
              })
            })
          }

          promise.then(db => { db.close()}) // Close connection before end

          this.status = ''
          this.loadOff()
        }).catch( er => {
          alert(er)
        })
      },
      // Sync Locations method
      syncLocations() {
        this.loadOn()
        this.status = 'Obteniendo datos del servidor'
        var dDt = []

        axios.get(this.api+'localizacion').then(res => {

          this.status = 'Sincronizando datos en la base de datos local...'
          if (Sqlite.exists('local')) {
            var promise = new Sqlite('local', (er) => {
              if (er) { alert(er) }
            })

            // Drop table existencia lote before insert data
            promise.then(db => {
              db.execSQL('delete from localizaciones')
            })

            // Loop data to insert into table
            res.data.forEach(cb => {
              promise.then(db => {
                db.execSQL('insert into localizaciones (bodega, localizacion, descripcion) values (?, ?, ?)', [cb.BODEGA, cb.LOCALIZACION, cb.DESCRIPCION], (er, id) => {
                  if (er) { alert(er) }
                })
              })
            })
          }

          promise.then(db => { db.close()}) // Close connection before end

          this.status = ''
          this.loadOff()
        }).catch( er => {
          alert(er)
        })
      }
    }
  }
</script>

<style lang="scss">
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

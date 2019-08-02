<template>
  <Page>
    <ActionBar title="Sincronizaciones" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack()" />
    </ActionBar>

    <StackLayout orientation="vertical" rows="20, *" >
      <Button text="Crear Base de datos local" @tap="createDb" :isEnabled="!busy" />
      <Button text="Borrar Base de datos local" @tap="dropDatabase" :isEnabled="!busy" />
      <Button text="Sincronizar Repuestos" @tap="syncItems" :isEnabled="!busy" />
      <Button text="Sincronizar Existencias" @tap="syncExists" :isEnabled="!busy" />
      <Button text="View Data" @tap="viewData" />

      <ActivityIndicator :busy="busy" @busyChange="busyChangeAction" v-show="busy" />
      <Progress :value="progress" maxValue="this.paginator.last_page" @valueChange="onValueChanged" v-show="busy" />
      <Label :text="status" class="fas" fontSize="14" verticalAlignment="center" horizontalAlignment="center" v-show="busy" />
      <ListView for="item in dbValues" @itemTap="onItemTap">
        <v-template>
          <!-- Shows the list item label in the default color and style. -->
          <Label>
            <Span :text="item.articulo" style="color: red" />
            <Span :text="item.cant_disponible" style="color: purple" />
          </Label>
        </v-template>
      </ListView>
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
        itemsPaginator: null,
        existsPaginator: null,
        dbValues: []
      }
    },
    mounted() {
      this.getPaginators()
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      getPaginators() {
        this.itemsPaginator = null
        this.existsPaginator = null
        this.getItemsPaginator()
        this.getExistsPaginator()
      },
      getItemsPaginator() {
        this.loadOn()
        // Get paginator
        axios.get(this.api+ 'articulos').then(res => {
          this.itemsPaginator = res.data
        }).catch(er => { alert(er) })
        this.loadOff()
      },
      getExistsPaginator() {
        this.loadOn()
        // Get paginator
        axios.get(this.api+ 'lote').then(res => {
          this.existsPaginator = res.data
        }).catch(er => { alert(er) })
        this.loadOff()
      },
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
        this.getPaginators() // Get the existing paginators

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
                  db.execSQL('create table if not exists existencia_lote (bodega varchar, articulo varchar, localizacion varchar, cant_disponible integer, cant_reservada integer)', (er) => {
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
        // Open db connection
        this.status = 'Abriendo conexión de db local'
        var db_promise = new Sqlite('local', (er, db) => {
          if (er) { alert(er) } else { console.log('DB open') }
        })

        // Drop data first
        if (Sqlite.exists('local')) {
         db_promise.then( db => {
           db.execSQL('delete from articulo', (er) => {
             if (er) { alert(er) }
           })
         })
       }

        this.status = 'Descargando repuestos del servidor...'

        //  Get data from server's api and store it in operations array for async axios
        try {

          let ops = []
          for (var i = this.itemsPaginator.current_page; i <= this.itemsPaginator.last_page; i++) {
            this.status = 'Descargando bloque '+ i +'/'+ this.itemsPaginator.last_page +  ' de datos.'
            let op = await axios.get(this.api+'articulos', {params: {page: i}})
            ops.push(op)
          }

          this.status = 'Insertando datos en la base de datos local'
          let dtReturned = await axios.all(ops)

          dtReturned.forEach(cb => {
            cb.data.data.forEach(cb2 => {
              db_promise.then(db => {
                db.execSQL('insert into articulo (articulo, descripcion, clasificacion_2, codigo_barras_vent, codigo_barras_invt) values (?, ?, ?, ?, ?)', [cb2.ARTICULO, cb2.DESCRIPCION, cb2.CLASIFICACION_2, cb2.CODIGO_BARRAS_VENT, cb2.CODIGO_BARRAS_INVT], er => {
                  if (er) { alert(er) }
                })
              })
            })
          })
        } catch (e) {
          alert(e)
        }
        db_promise.then(db => { db.close() })
        this.loadOff()
      },
      // Sync Exists
      async syncExists() {
        this.loadOn() // show activity indicator
        let ops = [] // array to store request for axios all

        if (Sqlite.exists('local')) {
          //  Check Local database
          this.status = 'Abriendo base de datos local'
          let db_promise = new Sqlite('local', (er, db) => {
            if(!er) {
              console.log('db open!')
            } else { alert(er) }
          })

          // Delete data from table
          this.status = 'Restableciendo la tabla'
          db_promise.then(db => {
            db.execSQL('delete from existencia_lote', er => {
              if (er) { alert(er) }
            })
          })

          // Get data from serve
          try {

            for (var i = 1; i <= this.existsPaginator.last_page; i++) {
              this.status = 'Obteniendo bloque '+ i + '/'+ this.existsPaginator.last_page +' de datos'

              let op = await axios.get(this.api+'lote', {params: {page: i}})
              ops.push(op)
            }

            let dataReturned = await axios.all(ops)

            this.status = 'Agregando datos a la base de datos local, espere...'
            dataReturned.forEach(cb => {
              cb.data.data.forEach(cb2 => {
                db_promise.then( db => {
                  db.execSQL('insert into existencia_lote (bodega, articulo, localizacion, cant_disponible, cant_reservada) values (?, ?, ?, ?, ?)', [cb2.BODEGA, cb2.ARTICULO, cb2.LOCALIZACION, cb2.CANT_DISPONIBLE, cb2.CANT_RESERVADA], er => {
                    if (er) { alert(er) }
                  })
                })
              })
            })
          } catch (e) {
            alert(e)
          }

          db_promise.then(db => { db.close() })
          this.loadOff()

        } else { alert('No existe la base de datos local') }
      },
      viewData() {
        if (Sqlite.exists('local')) {
          let db_promise = new Sqlite('local', (er) => {
            if (er) { alert(er) }
          })

          db_promise.then(db => {
            db.resultType(Sqlite.RESULTSASOBJECT)
            db.all('select * from existencia_lote', (er, res) => {
              if (!er) {
                this.dbValues = res
              } else { alert(er) }
            })
          })
        } else { alert('No existe db local') }
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

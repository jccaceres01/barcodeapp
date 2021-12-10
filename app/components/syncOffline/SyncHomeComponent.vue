<template>
  <Page>
    <ActionBar title="Sincronizaciones" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack()" />
    </ActionBar>

    <StackLayout orientation="vertical" rows="20, *" >
      <Button text="Crear Base de datos local" @tap="createDb" :isEnabled="!$store.state.loading" />
      <Button text="Borrar Base de datos local" @tap="dropDatabase" :isEnabled="!$store.state.loading" />
      <Button text="Sincronizar Bodegas" @tap="syncWarehouses" :isEnabled="!$store.state.loading" />
      <Button text="Sincronizar Localizaciones" @tap="syncLocations" :isEnabled="!$store.state.loading" />
      <Button text="Sincronizar Repuestos" @tap="syncItems" :isEnabled="!$store.state.loading" />
      <Button text="Sincronizar Existencias" @tap="syncExists" :isEnabled="!$store.state.loading" />
      <Button text="Revisar Data" @tap="checkData" :isEnabled="!$store.state.loading" />

      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Progress :value="progress" maxValue="this.paginator.last_page" v-show="true" />
      <Label :text="status" class="fas" fontSize="14" verticalAlignment="center" horizontalAlignment="center" v-if="$store.state.loading" />
    </StackLayout>
  </Page>
</template>

<script>

  import Sqlite from 'nativescript-sqlite'
  import conf from '../../customconfig.json'
  import { Http } from '@nativescript/core'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        api: conf.api,
        status: '',
        progress: 0,
      }
    },
    computed: {
      filtered() {
        return this.testList.filter(cb => {
          return (cb.ARTICULO.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1)
        })
      }
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

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

        if (Sqlite.exists('local')) {
          this.loadOn()
          try {
            this.status = ''
            const db = await Sqlite('local')

            // Drop local items (articulos)
            this.status = 'Borrando la base de datos local (Repuestos)'
            await db.execSQL('delete from articulo')

            // Read Data from server
            this.status = 'Obteniendo datos del servidor'
            let res = await Http.getJSON(`${this.api}/articulos`)

            if (res) {
              // Insert response data into local articulos
              res.forEach(async (el, index) => {
                this.status = `Sincronizando elemento ${index + 1} / ${res.length}`
                await db.execSQL('insert into articulo (articulo, descripcion, clasificacion_2, codigo_barras_vent, codigo_barras_invt) values (?, ?, ?, ?, ?)', [el.ARTICULO, el.DESCRIPCION, el.CLASIFICACION_2, el.CODIGO_BARRAS_VENT, el.CODIGO_BARRAS_INVT])
              })

              await db.close()
              alert('Repuestos sincronizados...')
            } else { 
              alert('No existen datos en el servidor')
            }

          } catch (error) { alert(error) }
          this.status = ''
          this.loadOff()
        } else { alert('No existe la base de datos local') }
      },
      // Sync Exists
      async syncExists() {
        if (Sqlite.exists('local')) {
          this.loadOn()
          try {
            const db = await Sqlite('local')

            // Drop current stock
            this.status = 'Borrando base de datos local (Existencias)'
            await db.execSQL('delete from existencia_lote')

            // Read stock from server
            this.status = 'Obteniendo datos del servidor'
            let res = await Http.getJSON(`${this.api}/lote`)

            if (res) {
              // Insert responsed data from server into local db (existencia_lote)
              res.forEach(async (el, index) => {
                this.status = `Sincronizando elemento ${index + 1} / ${res.length}`
                db.execSQL('insert into existencia_lote (bodega, articulo, descripcion, localizacion, clasificacion_2, cant_disponible, cant_reservada) values (?, ?, ?, ?, ?, ?, ?)', [el.BODEGA, el.ARTICULO, el.DESCRIPCION, el.LOCALIZACION, el.CLASIFICACION_2, el.CANT_DISPONIBLE, el.CANT_RESERVADA])
              })

              alert('Existencias sincronizadas...')
            } else { alert('No hay datos en el servidor (Existencias)') }
          } catch (error) { alert(error) }
          this.status = ''
          this.loadOff()
        } else { alert('No existe la base datos local') }
      },
      // Sync Warehouses
      async syncWarehouses() {
        if (Sqlite.exists('local')) {
          this.loadOn()
          try {
            this.status = 'Obteniendo datos del servidor...'
            let res = await Http.getJSON(`${this.api}/bodega`)

            if (res) {
              const db = await Sqlite('local')

              // Drop table existencia lote before insert data
              this.status = 'Borrando bodegas locales...'
              await db.execSQL('delete from bodegas')
              // Loop data to insert into table
              res.forEach(async (el, index) => {
                this.status = `Insertando elemento ${index + 1} / ${res.length}`
                await db.execSQL('insert into bodegas (bodega, nombre) values (?, ?)', [el.BODEGA, el.NOMBRE])
              })
              await db.close()
              alert('Bodegas sincronizadas...')
            } else { alert('No hay datos en el servidor') }
          } catch (error) { 
            alert(error)
          }
          this.loadOff()
          this.status = ''
        } else {
          alert('No existe la base de datos local')
        }
      },
      // Sync Locations method
      async syncLocations() {
        if (Sqlite.exists('local')) {
          this.loadOn()
          
          try {
            this.status = 'Obteniendo datos del servidor'
            let res = await Http.getJSON(`${this.api}/localizacion`)

            if (res) {
              const db = await Sqlite('local')
              // Drop table localizaciones before insert data
              await db.execSQL('delete from localizaciones')

              // Loop data to insert into table
              res.forEach(async (el, index) => {
                this.status = `Sincronizando elementos ${index + 1} / ${res.length}`
                await db.execSQL('insert into localizaciones (bodega, localizacion, descripcion) values (?, ?, ?)', [el.BODEGA, el.LOCALIZACION, el.DESCRIPCION])
              })

              await db.close()
              alert('Localizaciones sincronizadas')
            } else { alert('No hay datos en el servidor') }

          } catch (error) { alert(error) }
          this.loadOff()
          this.status = ''
        } else {
          alert('No existe la base de datos local')
        }
      },
      async checkData() {
        try {
          if (Sqlite.exists('local')) {
            const db = await Sqlite('local')

            let data = await db.all('select * from existencia_lote')
            alert(JSON.stringify(data.length))
            await db.close()
          }
        } catch (error) {
          alert(error)
        }
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

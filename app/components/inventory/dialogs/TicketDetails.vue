<template>
  <Page>
    <ActionBar title="Detalle de Boleta" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <!-- Boleta -->
      <Label grapText="true">
        <Span text="Boleta: " class="fa info" />
        <Span :text="this.BOLETA" style="color: #868686" />
      </Label>
      <!-- Articulo -->
      <Label grapText="true">
        <Span text="Articulo: " class="fa info" />
        <Span :text="this.ARTICULO" style="color: #868686" />
      </Label>
      <!-- Descripcion -->
      <Label grapText="true">
        <Span text="Descripcion: " class="fa info" />
        <Span :text="this.DESCRIPCION" style="color: #868686" />
      </Label>
      <!-- Bodega -->
      <Label grapText="true">
        <Span text="Bodega: " class="fa info" />
        <Span :text="this.BODEGA" style="color: #868686" />
      </Label>
      <!-- Localizacion -->
      <Label grapText="true">
        <Span text="Localizacion: " class="fa info" />
        <Span :text="this.LOCALIZACION" style="color: #868686" />
      </Label>
      <!-- Lote -->
      <Label grapText="true">
        <Span text="Lote: " class="fa info" />
        <Span :text="this.LOTE" style="color: #868686" />
      </Label>
      <!-- CANT_DISP_RESERV -->
      <Label grapText="true">
        <Span text="Cant. Disponible Reserva: " class="fa info" />
        <Span :text="this.CANT_DISP_RESERV" style="color: #868686" />
      </Label>
      <!-- CANT_NO_APROBADA -->
      <Label grapText="true">
        <Span text="Cant. No aprovada: " class="fa info" />
        <Span :text="this.CANT_NO_APROBADA" style="color: #868686" />
      </Label>
      <!-- CANT_VENCIDA -->
      <Label grapText="true">
        <Span text="Cant. Vencida: " class="fa info" />
        <Span :text="this.CANT_VENCIDA" style="color: #868686" />
      </Label>
      <!-- Validada -->
      <Label grapText="true">
        <Span text="Validada: " class="fa info" />
        <Span :text="this.VALIDADA" style="color: #868686" />
      </Label>
      <!-- SERIE_CADENA_DISP -->
      <Label grapText="true">
        <Span text="Serie Cadena Disponible: " class="fa info" />
        <Span :text="this.SERIE_CADENA_DISP" style="color: #868686" />
      </Label>
      <!-- SERIE_CADENA_NOAPR -->
      <Label grapText="true">
        <Span text="Serie Cadena no aprovada: " class="fa info" />
        <Span :text="this.SERIE_CADENA_NOAPR" style="color: #868686" />
      </Label>
      <!-- SERIE_CADENA_VENC -->
      <Label grapText="true">
        <Span text="Serie Cadena Vencida: " class="fa info" />
        <Span :text="this.SERIE_CADENA_VENC" style="color: #868686" />
      </Label>
      <Button text="Borrar Boleta" @tap="delTicket" />
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../../customconfig.json'
  import axios from 'axios'

  export default {
    data() {
      return {
        apiUrl: conf.api,
        busy: false
      }
    },
    props: [
      'BOLETA',
      'ARTICULO',
      'BODEGA',
      'LOCALIZACION',
      'LOTE',
      'CANT_DISP_RESERV',
      'CANT_NO_APROBADA',
      'CANT_VENCIDA',
      'USUARIO',
      'FECHA_HORA',
      'VALIDADA',
      'SERIE_CADENA_DISP',
      'SERIE_CADENA_NOAPR',
      'SERIE_CADENA_VENC',
      'DESCRIPCION'
    ],
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false },
      delTicket() {
        confirm('Desea Borrar Esta Boleta?')
          .then(result => {
            if (result) {
              this.loadOn()
              axios.delete(this.apiUrl+'inventory/ticket/'+this.BOLETA)
                .then(res => {
                  this.loadOff()
                  alert('Boleta Borrada!')
                  this.$navigateBack()
                }).catch(er => {
                  alert(er)
                })
              } else {}
            });
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../../app-variables';
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

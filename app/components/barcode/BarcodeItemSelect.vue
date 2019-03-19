<template>
  <Page>
    <StackLayout>
      <ActivityIndicator :busy="busy" />
      <Label text="Seleccionar Repuesto" style="font-size:20; font-weight:bold;" />
      <ListView for="item in items" @itemTap="sendSelected" v-show="!hasItemSelected" height="*" >
        <v-template>
          <StackLayout orientation="vertical">
            <Label height="20" width="*">
              <Span text="Descripción" />
              <Span :text="item.DESCRIPCION" class="desc" />
            </Label>
            <Label height="20" width="*">
              <Span text="Cod. Softland" class="fa" />
              <Span :text="item.ARTICULO" class="desc" />
            </Label>
            <Label v-if="(item.CLASIFICACION_2 == '02-01')" height="20" width="*">
              <Span text="Original: " style="styles" />
              <Span class="fa" text.decode="&#xf058; "/>
            </Label>
            <Label v-else height="20" width="*">
              <Span text="After Market: " style="styles" />
              <Span class="fa" text.decode="&#xf057; "/>
            </Label>
          </StackLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  import axios from 'axios'
  import conf from '../../customconfig.json'

  export default {
    data() {
      return {
        busy: false,
        api: conf.api,
        items: [],
      }
    },
    props: ['criteria'],
    created() {
      this.fillList()
    },
    methods: {
      loadOn() {
        this.busy = true
      },
      loadOff() {
        this.busy = false
      },
      fillList() {
        this.loadOn()
        axios.get(this.api+'search/articulos', {
          params: {
            criteria: this.criteria}
          }
        ).then(res => {
          if (res.data != '') {
            this.items = res.data
            this.loadOff()
          } else {
            alert('Repuesto no Encontrado')
              .then(() => {
                this.$modal.close()
              });
          }
        }).catch(er => {
          alert(er)
            .then(() => {
              this.$modal.close()
            });
        })
      },
      sendSelected(event) {
        this.$modal.close(event.item)
      }
    }
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

  .desc {
    font-size: 16;
    color: #747474;
  }

  .info {
      font-size: 20;
  }
</style>

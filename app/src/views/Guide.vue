<template>
  <v-card class="black--text">
    <v-toolbar color="primary" dark>
      <span class="title">User Guide</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="body-1 py-8">
      <!-- <iframe width="1100" height="619" src="https://www.youtube.com/embed/xFTgoVptBfk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> -->
      <!-- <iframe width="1100" height="619" src="https://www.youtube.com/embed/videoseries?list=PLu4ITwMWwGmfV28wnLnxPSlG2BjNSTYkf" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> -->
      <v-row>
        <v-col cols="3">
          <v-list shaped dense>
            <v-subheader class="subtitle-2 mt-n4">Video Tutorials</v-subheader>
            <v-list-item-group v-model="videoIndex" color="primary">
              <v-list-item
                v-for="(video, i) in videos"
                :key="i">
                <v-list-item-icon class="mr-4">
                  <v-icon>mdi-video</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="video.text"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
        <v-col cols="9">
          <div v-if="video">
            <iframe width="800" height="450" :src="'https://www.youtube.com/embed/' + video.youtubeId" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
          <div v-else>
            <v-alert color="primary" outlined prominent icon="mdi-chevron-left" :value="true">
              <span class="subtitle-1">Select a Video</span>
            </v-alert>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4">
      <v-spacer></v-spacer>
      <v-btn to="/" text>close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Guide',
  data () {
    return {
      videoIndex: 0,
      videos: [
        {
          text: 'Introduction',
          youtubeId: 'xFTgoVptBfk'
        },
        {
          text: 'Create a Project',
          youtubeId: '9oJNzIBcIB4'
        },
        {
          text: 'Save and Publish a Project',
          youtubeId: 'OIJlv7HoGoE'
        },
        {
          text: 'Edit a Project',
          youtubeId: 'oDCHwnYQREw'
        }
      ]
    }
  },
  computed: {
    video () {
      return isFinite(this.videoIndex) ? this.videos[this.videoIndex] : null
    }
  }
}
</script>

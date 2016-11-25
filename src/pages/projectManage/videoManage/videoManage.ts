import { Component, AfterViewInit, OnDestroy, OnInit } from "@angular/core";
import { NavController, Platform, App, NavParams } from "ionic-angular";
import {CameraBean, CameraVideoUrl, ProjectDetailBean} from "../../../beans/beans";
import { CommonHttpService } from "../../../services/common-http-service";
import {ProjectService} from "../../../services/project-service";

declare var AMap;
declare var HNBridge;

@Component({
  templateUrl: 'videoManage.html'
})
export class ProjectManageVideo implements OnInit, OnDestroy, AfterViewInit {

  public projectDetailList: ProjectDetailBean[] = [];

  public map: any;
  public marker: any;
  public markers: any = [];

  public beatHeartTimer: number;
  public curVideoUrl: CameraVideoUrl;

  constructor(public navCtrl: NavController,
    public params: NavParams,
    public platform: Platform,
    public commonHttpService: CommonHttpService,
  public projectService: ProjectService) {
    this.beatHeartTimer = -1;
  }

  ngOnInit(): void {
    this.projectService.getProjectInfo('').subscribe(data => {
      if (data) {
        this.projectDetailList = data;
      }
    });
  }

  ngOnDestroy(): void {
    this.clearBeatHeart();
  }
  ngAfterViewInit(): void {
    this.markWithVideo(this.projectDetailList[0]);

  }

  markWithVideo(projectDetail: ProjectDetailBean) {
    let pLon = projectDetail.lonLat.split(";")[0].split(",")[0];
    let pLat = projectDetail.lonLat.split(";")[0].split(",")[1];
    this.map = new AMap.Map('videomap', {
      zoom: 14,
      zoomEnable: true,
      center: [pLon, pLat]
    });

    AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], () => {
      this.map.addControl(new AMap.ToolBar());
      this.map.addControl(new AMap.Scale());
    });

    for (let i = 0; i < projectDetail.equips.length; i++) {
      this.markers[i] = new AMap.Marker({
        position: [projectDetail.equips[i].longitude, projectDetail.equips[i].longitude],
        draggable: false,
        map: this.map
      });
      AMap.event.addListener(this.marker, 'touchend', () => {
        console.log("aaaaaaaaaaaa");
        // this.startPlay();
      });
      AMap.event.addListener(this.marker, 'click', () => {
        // this.startPlay();
        console.log("aaaaaaaaaaaa");
      });
    }
  }

  getCameraValue(item) {
    return item.guId;
  }

  onCameraSel(ev) {
  }

  startBeatHeart() {
    if (this.beatHeartTimer !== -1) {
      clearInterval(this.beatHeartTimer);
    }

    this.sendBeatHeart();
    this.beatHeartTimer = setInterval(() => {
      this.sendBeatHeart();
    }, 10000);
  }

  sendBeatHeart() {
    this.commonHttpService.sendVideoBeatHeart(this.curVideoUrl.guId).subscribe(() => {
    });
  }

  clearBeatHeart() {
    if (this.beatHeartTimer !== -1) {
      clearInterval(this.beatHeartTimer);
      this.beatHeartTimer = -1;
    }
  }

  startPlay(item: any) {
    let curCamera: CameraBean = item;
    this.commonHttpService.getVideoPlayUrl(item.guId, "bus").subscribe(info => {
      if (info) {
        this.curVideoUrl = info;
        this.startBeatHeart();
        this.platform.ready().then(() => {
          HNBridge.playVideoUrl(this.curVideoUrl.playUrl, curCamera.channelName);
        });
      }
    });
  }

}

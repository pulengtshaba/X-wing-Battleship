import {entity_manager} from './entity-manager.js';
import {entity} from './entity.js';

import {load_controller} from './load-controller.js';
import {spawners} from './spawners.js';

import {spatial_hash_grid} from './spatial-hash-grid.js';
import {threejs_component} from './threejs-component.js';
import {ammojs_component} from './ammojs-component.js';
import {blaster} from './fx/blaster.js';
import {ui_controller} from './ui-controller.js';
import {crawl_controller} from './crawl-controller.js';

import {math} from './math.js';

import {THREE} from './three-defs.js';


class Xwing_StarBattle {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this.entityManager_ = new entity_manager.EntityManager();

    this.OnGameStarted_();
  }

  OnGameStarted_() {
    this.grid_ = new spatial_hash_grid.SpatialHashGrid(
        [[-5000, -5000], [5000, 5000]], [100, 100]);

    this.LoadControllers_();

    //Kill counter
    const guiDiv = document.createElement('div');
    guiDiv.className = 'guiRoot guiBox';

    const killDiv = document.createElement('div');
    killDiv.className = 'vertical';

    const killTitle = document.createElement('div');
    killTitle.className = 'guiBigText';
    killTitle.innerText = 'KILLS';

    const killText = document.createElement('div');
    killText.className = 'guiSmallText';
    killText.innerText = '0';
    killText.id = 'KillText';

    killDiv.appendChild(killTitle);
    killDiv.appendChild(killText);

    guiDiv.appendChild(killDiv);
    document.body.appendChild(guiDiv);//End of Kill counter display code
      
    //Phase/stage display
    const guiDiV = document.createElement('div');
    guiDiV.className = 'guiR guiB';

    const MissionDiv = document.createElement('div');
    MissionDiv.className = 'vert';

    const MissionTitle = document.createElement('div');
    MissionTitle.className = 'guiBig';
    MissionTitle.innerText = 'Phase 1: Easy';
    MissionTitle.id = 'MissionTitle';

    const MissionText = document.createElement('div');
    MissionText.className = 'guiSmall';
    MissionText.innerText = 'Destroy All ten(10)\n Tie-Fighter ships';
    MissionText.id = 'MissionText';

    MissionDiv.appendChild(MissionTitle);
    MissionDiv.appendChild(MissionText);

    guiDiV.appendChild(MissionDiv);
    document.body.appendChild(guiDiV);//End of phase display code
    //Score display
    const guiDIV = document.createElement('div');
    guiDIV.className = 'guiRo guiBo';

    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'ver';

    const scoreTitle = document.createElement('div');
    scoreTitle.className = 'guiBg';
    scoreTitle.innerText = 'Score: ';

    const scoreText = document.createElement('div');
    scoreText.className = 'guiSml';
    scoreText.innerText = '0';
    scoreText.id = 'scoreText';

    scoreDiv.appendChild(scoreTitle);
    scoreDiv.appendChild(scoreText);

    guiDIV.appendChild(scoreDiv);
    document.body.appendChild(guiDIV);//End of score display code

    //Score counter display
    var score = 0;
    window.setInterval(function () {
        score += 2;
        document.getElementById('scoreText').innerText = score;
    }, 10);//End of Display 
    //Win/loss display
    const guIDIV = document.createElement('div');
    guIDIV.className = 'guiRot guiBot';

    const congratDiv = document.createElement('div');
    congratDiv.className = 'vrt';

    const congratTitle = document.createElement('div');
    congratTitle.className = 'guiBgt';
    congratTitle.innerText = 'Congratulations';

    const congratText = document.createElement('div');
    congratText.className = 'guiSmlt';
    congratText.innerText = 'You just started\n Phase 1';
    congratText.id = 'congratText';

    congratDiv.appendChild(congratTitle);
    congratDiv.appendChild(congratText);

    guIDIV.appendChild(congratDiv);
    document.body.appendChild(guIDIV);//End of Win/loss display code


    this.previousRAF_ = null;
    this.RAF_();
  }

  LoadControllers_() {
    const threejs = new entity.Entity();
    threejs.AddComponent(new threejs_component.ThreeJSController());
    this.entityManager_.Add(threejs, 'threejs');

    const ammojs = new entity.Entity();
    ammojs.AddComponent(new ammojs_component.AmmoJSController());
    this.entityManager_.Add(ammojs, 'physics');

    // Hack
    this.ammojs_ = ammojs.GetComponent('AmmoJSController');
    this.scene_ = threejs.GetComponent('ThreeJSController').scene_;
    this.camera_ = threejs.GetComponent('ThreeJSController').camera_;
    this.threejs_ = threejs.GetComponent('ThreeJSController');

    const l = new entity.Entity();
    l.AddComponent(new load_controller.LoadController());
    this.entityManager_.Add(l, 'loader');

    const fx = new entity.Entity();
    fx.AddComponent(new blaster.BlasterSystem({
        scene: this.scene_,
        camera: this.camera_,
        texture: './resources/textures/fx/blaster.jpg',
    }));
    this.entityManager_.Add(fx, 'fx');

    // DEMO
    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this.entityManager_.Add(ui, 'ui');

    const basicParams = {
      grid: this.grid_,
      scene: this.scene_,
      camera: this.camera_,
    };

    // DEMO
    // const crawl = new entity.Entity();
    // crawl.AddComponent(new crawl_controller.CrawlController(basicParams))
    // this.entityManager_.Add(crawl);

    const spawner = new entity.Entity();
    spawner.AddComponent(new spawners.PlayerSpawner(basicParams));
    spawner.AddComponent(new spawners.TieFighterSpawner(basicParams));
    spawner.AddComponent(new spawners.XWingSpawner(basicParams));
    spawner.AddComponent(new spawners.StarDestroyerSpawner(basicParams));
    spawner.AddComponent(new spawners.StarDestroyerTurretSpawner(basicParams));
    spawner.AddComponent(new spawners.ExplosionSpawner(basicParams));
    spawner.AddComponent(new spawners.TinyExplosionSpawner(basicParams));
    spawner.AddComponent(new spawners.ShipSmokeSpawner(basicParams));
    this.entityManager_.Add(spawner, 'spawners');

    // DEMO
    spawner.GetComponent('PlayerSpawner').Spawn();
    spawner.GetComponent('StarDestroyerSpawner').Spawn();
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      } else {
        this.Step_(t - this.previousRAF_);
        this.threejs_.Render();
        this.previousRAF_ = t;
      }

      setTimeout(() => {
        this.RAF_();
      }, 1);
    });
  }

  Step_(timeElapsed) {
    
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this.entityManager_.Update(timeElapsedS, 0);
    this.entityManager_.Update(timeElapsedS, 1);

    this.ammojs_.StepSimulation(timeElapsedS);
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  const _Setup = () => {
    Ammo().then(function(AmmoLib) {
      Ammo = AmmoLib;
      _APP = new Xwing_StarBattle();
    }); 
    document.body.removeEventListener('click', _Setup);
  };
  document.body.addEventListener('click', _Setup);
});

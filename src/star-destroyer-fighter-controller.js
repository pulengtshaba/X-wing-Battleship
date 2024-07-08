import {THREE} from './three-defs.js';

import {entity} from './entity.js';
import {math} from './math.js';


export const star_destroyer_fighter_controller = (() => {


  class StarDestroyerFighterController extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.fighters_ = [];


      const down = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0));
      const up = new THREE.Quaternion();
      //manually placing the turrents on the Boss ship
      this.turretOffsets_ = [
        [new THREE.Vector3(0.93 * 50, 0.65 * 50, 0), up],
        [new THREE.Vector3(1.27 * 50, 0.62 * 50, 0), up],
        [new THREE.Vector3(0.59 * 50, 0.68 * 50, 0), up],

        [new THREE.Vector3(-5.02 * 50, -1.13 * 50, 4.39 * 50), down],
        [new THREE.Vector3(-5.02 * 50, -1.13 * 50, -4.39 * 50), down],

        [new THREE.Vector3(-0.44 * 50, -1.52 * 50, 1.05 * 50), down],
        [new THREE.Vector3(-0.44 * 50, -1.52 * 50, -1.05 * 50), down],

        [new THREE.Vector3(3.6 * 50, -1.39 * 50, 0.39 * 50), down],
        [new THREE.Vector3(3.6 * 50, -1.39 * 50, -0.39 * 50), down],
      ];
    }

    SpawnFighters_() {
      // Adds more Xwing ships to the game, besides main player ship
    for (let i = 0; i < 5; ++i) {
      const c = this.FindEntity('spawners').GetComponent('XWingSpawner').Spawn();
      const m = new THREE.Vector3(
        math.rand_range(-1, 1),
        math.rand_range(-1, 1),
        math.rand_range(-1, 1),
      );
      m.normalize();
      m.multiplyScalar(800);
      c.SetPosition(m);
        // Adds more tie fighter ships to the game
    for (let i = 0; i < 2; ++i) {
      const e = this.FindEntity('spawners').GetComponent('TieFighterSpawner').Spawn();
      const n = new THREE.Vector3(
        math.rand_range(-1, 1),
        math.rand_range(-1, 1),
        math.rand_range(-1, 1),
      );
      n.normalize();
      n.multiplyScalar(500);
      e.SetPosition(n);
    }
    }
      //Adding many enemy ships to the game
      /*const spawner = this.FindEntity('spawners').GetComponent('TieFighterSpawner');
      for (let i = 0; i < 1; ++i) {
        const n = new THREE.Vector3(
          math.rand_range(-1, 1),
          math.rand_range(-1, 1),
          math.rand_range(-1, 1),
        );
        n.normalize();
        n.multiplyScalar(800);
        n.add(this.Parent.Position);

        const e = spawner.Spawn();
        e.SetPosition(n);

        this.fighters_.push(e);
      }*/
    }
    
    SpawnTurrets_() {
      const turretSpawner = this.FindEntity('spawners').GetComponent(
          'StarDestroyerTurretSpawner');

      const correction = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, -1));

      for (let i = 0; i < this.turretOffsets_.length; ++i) {
        const [pos, quat] = this.turretOffsets_[i];
        const e = turretSpawner.Spawn(pos, quat, correction);
        this.fighters_.push(e);
      }
  }

    Update(_) {
      if (this.fighters_.length > 0) {
        return;
      }

      // DEMO
      this.SpawnFighters_();
      this.SpawnTurrets_();
    }
  };

  return {
    StarDestroyerFighterController: StarDestroyerFighterController,
  };

})();
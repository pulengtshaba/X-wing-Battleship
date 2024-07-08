import {THREE} from './three-defs.js';

import {entity} from './entity.js';
import {math} from './math.js';


export const player_controller = (() => {

  class PlayerController extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      //@ 1st the player is not dead yet
      this.dead_ = false;
    }
    //Applies the physics to the scene, explosion on collision
    InitComponent() {
      this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
    }
    //controls how quick the ship responds to key entered!!!
    InitEntity() {
      this.decceleration_ = new THREE.Vector3(-0.0005, -0.0001, -1);
      this.acceleration_ = new THREE.Vector3(60, 0.3, 15000);
      this.velocity_ = new THREE.Vector3(0, 0, 0);
    }
    //On collision with any object in the scene, main player should die
    OnCollision_() {
      if (!this.dead_) {
        this.dead_ = true;
        console.log('EXPLODE ' + this.Parent.Name);
        this.Broadcast({topic: 'health.dead'});
      }
    }
    //When player gets hit by any enemy in the scene, player ship has fire on it 
    Fire_() {
      this.Broadcast({
          topic: 'player.fire'
      });
    }

    Update(timeInSeconds) {
      if (this.dead_) {
        return;
      }
      //if player hasn't pressed any key, then return 
      const input = this.Parent.Attributes.InputCurrent;
      if (!input) {
        return;
      }

      const velocity = this.velocity_;
      //After turning, ship must relax back to origin position(deccelerate)
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this.decceleration_.x,
          velocity.y * this.decceleration_.y,
          velocity.z * this.decceleration_.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);

      velocity.add(frameDecceleration);
      velocity.z = -math.clamp(Math.abs(velocity.z), 50.0, 125.0);
  
      const _PARENT_Q = this.Parent.Quaternion.clone();
      const _PARENT_P = this.Parent.Position.clone();

      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = _PARENT_Q.clone();
  
      const acc = this.acceleration_.clone();
      //Booster key, allows the ship to make quick turns
      if (input.shift) {
        acc.multiplyScalar(2.5);
      }
      //The YAW, PITCH & ROLL
      //When 'W' key is pressed. the player ship should roll(Rotation around the front-to-back axis)
      if (input.axis1Forward) {
        _A.set(1, 0, 0);
        _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * acc.y * input.axis1Forward);
        _R.multiply(_Q);
      }
      //When 'A' key is pressed, then player ship should apply a pitch(Rotation around the side-to-side axis)
      if (input.axis1Side) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, -Math.PI * timeInSeconds * acc.y * input.axis1Side);
        _R.multiply(_Q);
      }
      //When 'D' key is pressed, then player ship should apply a pitch(Rotation around the side-to-side axis)
      if (input.axis2Side) {
        _A.set(0, 0, -1);
        _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * acc.y * input.axis2Side);
        _R.multiply(_Q);
      }
      //ROLL-apply Rotation around the front-to-back axis
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(_PARENT_Q);
      forward.normalize();
      //Pitch-apply Rotation around the side-to-side axis
      const updown = new THREE.Vector3(0, 1, 0);
      updown.applyQuaternion(_PARENT_Q);
      updown.normalize();
      //Yaw-apply Rotation around the vertical axis
      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(_PARENT_Q);
      sideways.normalize();
  
      sideways.multiplyScalar(velocity.x * timeInSeconds);
      updown.multiplyScalar(velocity.y * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);
      //Apply movement of the ship in the scene
      const pos = _PARENT_P;
      pos.add(forward);
      pos.add(sideways);
      pos.add(updown);

      this.Parent.SetPosition(pos);
      this.Parent.SetQuaternion(_R);
      //Player ship can shot lasers from the 4 wing tips
      if (input.space) {
        this.Fire_();
      }
    }
  };
  
  return {
    PlayerController: PlayerController,
  };

})();
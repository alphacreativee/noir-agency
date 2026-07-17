var hoverEffect = function (opts) {
  var vertex = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `;

  var fragment = `
        varying vec2 vUv;

        uniform sampler2D texture;
        uniform sampler2D texture2;
        uniform sampler2D disp;

        uniform float dispFactor;
        uniform float effectFactor;
        uniform float angle;

        uniform vec2 repeat1;
        uniform vec2 offset1;
        uniform vec2 repeat2;
        uniform vec2 offset2;
        uniform vec2 repeatDisp;
        uniform vec2 offsetDisp;

        void main() {

            vec2 uv = vUv;

            vec2 uvDisp = uv * repeatDisp + offsetDisp;
            vec4 disp = texture2D(disp, uvDisp);

            // hướng dịch chuyển dựa theo angle (radian)
            vec2 dir = vec2(cos(angle), sin(angle));

            vec2 distortedPosition = uv + dispFactor * dir * (disp.r * effectFactor);
            vec2 distortedPosition2 = uv - (1.0 - dispFactor) * dir * (disp.r * effectFactor);

            vec2 uv1 = distortedPosition * repeat1 + offset1;
            vec2 uv2 = distortedPosition2 * repeat2 + offset2;

            vec4 _texture = texture2D(texture, uv1);
            vec4 _texture2 = texture2D(texture2, uv2);

            vec4 finalTexture = mix(_texture, _texture2, dispFactor);

            gl_FragColor = finalTexture;
        }
    `;

  var parent = opts.parent || console.warn("no parent");
  var dispImage =
    opts.displacementImage || console.warn("displacement image missing");
  var image1 = opts.image1 || console.warn("first image missing");
  var image2 = opts.image2 || console.warn("second image missing");

  // ép kiểu số an toàn: nếu opts.intensity là string (vd từ getAttribute) vẫn parse đúng
  // đồng thời giới hạn (cap) khoảng dịch chuyển tối đa để hiệu ứng luôn "nhẹ"
  var maxDisplacement =
    opts.maxDisplacement !== undefined
      ? parseFloat(opts.maxDisplacement)
      : 0.01; // ~2% chiều rộng ảnh, chỉnh số này để nới/siết chung toàn site

  var intensity = parseFloat(opts.intensity);
  if (isNaN(intensity)) intensity = 1;
  intensity = Math.min(intensity, maxDisplacement);

  var angle = parseFloat(opts.angle);
  if (isNaN(angle)) angle = 0;

  var speedIn = opts.speedIn || 2.2;
  var speedOut = opts.speedOut || 1.8;
  var userHover = opts.hover === undefined ? true : opts.hover;
  var easing = opts.easing || Expo.easeOut;

  var mobileAndTabletcheck = function () {
    var check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          a,
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4),
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  };

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(
    parent.offsetWidth / -2,
    parent.offsetWidth / 2,
    parent.offsetHeight / 2,
    parent.offsetHeight / -2,
    1,
    1000,
  );

  camera.position.z = 1;

  var renderer = new THREE.WebGLRenderer({
    antialias: false,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff, 0.0);
  renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  parent.appendChild(renderer.domElement);

  // Tính repeat/offset kiểu object-fit: cover
  function getCoverUV(image) {
    if (!image || !image.naturalWidth)
      return { repeat: [1, 1], offset: [0, 0] };

    var containerWidth = parent.offsetWidth;
    var containerHeight = parent.offsetHeight;
    var imageAspect = image.naturalWidth / image.naturalHeight;
    var containerAspect = containerWidth / containerHeight;

    if (containerAspect > imageAspect) {
      return {
        repeat: [1, imageAspect / containerAspect],
        offset: [0, (1 - imageAspect / containerAspect) / 2],
      };
    } else {
      return {
        repeat: [containerAspect / imageAspect, 1],
        offset: [(1 - containerAspect / imageAspect) / 2, 0],
      };
    }
  }

  var loader = new THREE.TextureLoader();
  loader.crossOrigin = "";

  // mat phải khai báo TRƯỚC loader.load vì callback bên dưới có tham chiếu tới mat.uniforms
  var mat = new THREE.ShaderMaterial({
    uniforms: {
      effectFactor: { type: "f", value: intensity },
      angle: { type: "f", value: angle },
      dispFactor: { type: "f", value: 0.0 },
      texture: { type: "t", value: null },
      texture2: { type: "t", value: null },
      disp: { type: "t", value: null },
      repeat1: { type: "v2", value: new THREE.Vector2(1, 1) },
      offset1: { type: "v2", value: new THREE.Vector2(0, 0) },
      repeat2: { type: "v2", value: new THREE.Vector2(1, 1) },
      offset2: { type: "v2", value: new THREE.Vector2(0, 0) },
      repeatDisp: { type: "v2", value: new THREE.Vector2(1, 1) },
      offsetDisp: { type: "v2", value: new THREE.Vector2(0, 0) },
    },

    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    opacity: 1.0,
  });

  var texture1 = loader.load(image1, function (tex) {
    var uv = getCoverUV(tex.image);
    mat.uniforms.repeat1.value.set(uv.repeat[0], uv.repeat[1]);
    mat.uniforms.offset1.value.set(uv.offset[0], uv.offset[1]);
  });
  var texture2 = loader.load(image2, function (tex) {
    var uv = getCoverUV(tex.image);
    mat.uniforms.repeat2.value.set(uv.repeat[0], uv.repeat[1]);
    mat.uniforms.offset2.value.set(uv.offset[0], uv.offset[1]);
  });

  var disp = loader.load(dispImage, function (tex) {
    var uv = getCoverUV(tex.image);
    mat.uniforms.repeatDisp.value.set(uv.repeat[0], uv.repeat[1]);
    mat.uniforms.offsetDisp.value.set(uv.offset[0], uv.offset[1]);
  });
  disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

  texture1.magFilter = texture2.magFilter = THREE.LinearFilter;
  texture1.minFilter = texture2.minFilter = THREE.LinearFilter;

  texture1.anisotropy = renderer.getMaxAnisotropy();
  texture2.anisotropy = renderer.getMaxAnisotropy();

  // gán texture vào uniform sau khi đã load() (texture object tồn tại ngay, chỉ ảnh bên trong load async)
  mat.uniforms.texture.value = texture1;
  mat.uniforms.texture2.value = texture2;
  mat.uniforms.disp.value = disp;

  var geometry = new THREE.PlaneBufferGeometry(
    parent.offsetWidth,
    parent.offsetHeight,
    1,
  );
  var object = new THREE.Mesh(geometry, mat);
  scene.add(object);

  var addEvents = function () {
    var evtIn = "mouseenter";
    var evtOut = "mouseleave";
    if (mobileAndTabletcheck()) {
      evtIn = "touchstart";
      evtOut = "touchend";
    }
    parent.addEventListener(evtIn, function (e) {
      TweenMax.killTweensOf(mat.uniforms.dispFactor);
      TweenMax.to(mat.uniforms.dispFactor, speedIn, {
        value: 1,
        ease: easing,
      });
    });

    parent.addEventListener(evtOut, function (e) {
      TweenMax.killTweensOf(mat.uniforms.dispFactor);
      TweenMax.to(mat.uniforms.dispFactor, speedOut, {
        value: 0,
        ease: easing,
      });
    });
  };

  if (userHover) {
    addEvents();
  }

  window.addEventListener("resize", function (e) {
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);

    camera.left = parent.offsetWidth / -2;
    camera.right = parent.offsetWidth / 2;
    camera.top = parent.offsetHeight / 2;
    camera.bottom = parent.offsetHeight / -2;
    camera.updateProjectionMatrix();

    geometry.dispose();
    object.geometry = new THREE.PlaneBufferGeometry(
      parent.offsetWidth,
      parent.offsetHeight,
      1,
    );

    var uv1 = getCoverUV(texture1.image);
    mat.uniforms.repeat1.value.set(uv1.repeat[0], uv1.repeat[1]);
    mat.uniforms.offset1.value.set(uv1.offset[0], uv1.offset[1]);

    var uv2 = getCoverUV(texture2.image);
    mat.uniforms.repeat2.value.set(uv2.repeat[0], uv2.repeat[1]);
    mat.uniforms.offset2.value.set(uv2.offset[0], uv2.offset[1]);

    var uvDisp = getCoverUV(disp.image);
    mat.uniforms.repeatDisp.value.set(uvDisp.repeat[0], uvDisp.repeat[1]);
    mat.uniforms.offsetDisp.value.set(uvDisp.offset[0], uvDisp.offset[1]);
  });

  this.next = function () {
    TweenMax.killTweensOf(mat.uniforms.dispFactor);
    TweenMax.to(mat.uniforms.dispFactor, speedIn, {
      value: 1,
      ease: easing,
    });
  };

  this.previous = function () {
    TweenMax.killTweensOf(mat.uniforms.dispFactor);
    TweenMax.to(mat.uniforms.dispFactor, speedOut, {
      value: 0,
      ease: easing,
    });
  };

  var animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  };
  animate();
};

var MainScene = pc.createScript('Main-Scene-Script');

MainScene.attributes.add('speed', { 
    type: 'number', default: 10 
});

MainScene.prototype.initialize = function() {

    const bolt = assets.bolt.resource.instantiateRenderEntity({});
    app.root.addChild(bolt);
    
    var shaderDefinition = {
        attributes: {
            vVertex: pc.SEMANTIC_POSITION,
            vNormal: pc.SEMANTIC_NORMAL,
            vTexCoord: pc.SEMANTIC_TEXCOORD0
        },
        vshader: assets.vs.resource,
        fshader: assets.fs.resource
    };
    
    var newShader = new pc.Shader(device, shaderDefinition);
    bolt.render.meshInstances[0].material = new pc.Material();
    bolt.render.meshInstances[0].material.shader = newShader;
    
    bolt.render.meshInstances[0].material.setParameter('uTime', 0);
    bolt.render.meshInstances[0].material.setParameter('uDiffuseMap', assets.boltMatCap.resource);
    

    const topText = new pc.Entity('toptext');
    topText.addComponent('element', {
        pivot: new pc.Vec2(0.5, 0.5),
        anchor: new pc.Vec4(0.5, 1, 0.5, 1),
        type: pc.ELEMENTTYPE_TEXT,
        font: assets.bpFont.resource,
        fontSize: 52,
        text: "PWA Template",
        color: [0.01,0.01,0.01],
        alignment: [0.5,0.5],
    });
    uiGroup.addChild(topText);
    topText.setLocalPosition(0,-105,0);


    const light = new pc.Entity('light');
    light.addComponent('light');
    app.root.addChild(light);
    light.setEulerAngles(45, 0, 0);
    
    app.on('update', dt => bolt.rotate(10 * dt, 20 * dt, 10 * dt));

    //Device resize and orientation listeners
    //window.addEventListener('resize', () => this.resizeMethod());
    //window.addEventListener('orientationchange', () => this.resizeMethod());
};

MainScene.prototype.update = function(dt) {

};

MainScene.prototype.swap = function(old) {

};
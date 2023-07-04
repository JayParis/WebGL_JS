
precision highp float;

const vec4 cons1 = vec4(0.800000011921, 0.800000011921, 0.800000011921, 1.000000000000);

uniform sampler2D uDiffuseMap;
uniform float uTime;

varying vec3 Normal;
varying vec2 TexCoord;
varying vec3 Position;


void material_preview_matcap(sampler2D ima,  vec4 mask, out vec4 result)
{
	vec2 tex = vec2(0,0);
    
	tex.x =  0.5 + 0.5 * Normal.x;
	tex.y =  0.5 + 0.5 * Normal.y;
    
	result = texture2D(ima, tex) * mask;
}

void main()
{
	vec4 tmp5;
	vec4 mask;

	mask = vec4(1.0, 1.0, 1.0, 1.0);
	material_preview_matcap(uDiffuseMap,  mask, tmp5);
    
    gl_FragColor =  tmp5;
}


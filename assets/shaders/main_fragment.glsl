precision mediump float;

varying vec4 fragTexCoord;
uniform sampler2D sampler;

float textureSizeWidth = 750.0;
float textureSizeHeight = 938.0;
float texelSizeX = (1.0 / (textureSizeWidth / 8.0));
float texelSizeY = (1.0 / (textureSizeHeight / 8.0));

vec4 tex2DBiLinear( sampler2D textureSampler_i, vec2 texCoord_i )
{
   vec4 p0q0 = texture2D(textureSampler_i, texCoord_i);
   vec4 p1q0 = texture2D(textureSampler_i, texCoord_i + vec2(texelSizeX, 0));

   vec4 p0q1 = texture2D(textureSampler_i, texCoord_i + vec2(0, texelSizeY));
   vec4 p1q1 = texture2D(textureSampler_i, texCoord_i + vec2(texelSizeX , texelSizeY));

   float a = fract( texCoord_i.x * textureSizeWidth );

   vec4 pInterp_q0 = mix( p0q0, p1q0, a );
   vec4 pInterp_q1 = mix( p0q1, p1q1, a );

   float b = fract( texCoord_i.y * textureSizeHeight );
   return mix( pInterp_q0, pInterp_q1, b );
}
void main() { 

   gl_FragColor = tex2DBiLinear(sampler,fragTexCoord.xy);
}
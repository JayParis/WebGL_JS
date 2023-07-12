precision mediump float;

varying vec4 fragTexCoord;
uniform sampler2D sampler_1;
uniform sampler2D sampler_2;

float textureSizeWidth = 750.0;
float textureSizeHeight = 938.0;
float texelSizeX = (1.0 / (textureSizeWidth / 16.0)); //8.0
float texelSizeY = (1.0 / (textureSizeHeight / 16.0));

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
void main() 
{ 
   //vec2 v_UV = gl_FragCoord.xy / fragTexCoord.zw;
   vec2 v_UV = gl_FragCoord.xy / vec2(textureSizeWidth, textureSizeHeight);


   vec2 FBOflipUV = vec2(fragTexCoord.x,fragTexCoord.y);
   gl_FragColor = tex2DBiLinear(sampler_2,v_UV);
   //gl_FragColor = texture2D(sampler_1,fragTexCoord.xy);
}
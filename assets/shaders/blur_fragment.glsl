precision mediump float;

varying vec4 fragTexCoord;
uniform sampler2D sampler_1;
uniform sampler2D sampler_2;

float textureSizeWidth = 750.0;
float textureSizeHeight = 938.0;
float texelSizeX = (1.0 / (textureSizeWidth / 8.0));
float texelSizeY = (1.0 / (textureSizeHeight / 8.0));

void main() { 
   vec4 tex_1 = texture2D(sampler_1,fragTexCoord.xy);
   vec4 tex_2 = texture2D(sampler_2,fragTexCoord.xy);

   gl_FragColor = mix(tex_1,tex_2, fragTexCoord.x);
}
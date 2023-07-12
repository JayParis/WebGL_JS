precision mediump float;

varying vec4 fragTexCoord;
uniform sampler2D sampler_1;
uniform sampler2D sampler_2;

float textureSizeWidth = 750.0;
float textureSizeHeight = 938.0;
float texelSizeX = (1.0 / (textureSizeWidth / 8.0));
float texelSizeY = (1.0 / (textureSizeHeight / 8.0));

void main() { 
   vec2 v_UV = gl_FragCoord.xy / fragTexCoord.zw;

   float bm_t = smoothstep(0.9,1.0,v_UV.y);
   float bm_b = smoothstep(0.6,0.20,v_UV.y);
   float _blur = bm_t + bm_b;

   float dm_t = smoothstep(0.9,1.0,v_UV.y) * 0.7;
   float dm_b = smoothstep(0.5,0.05,v_UV.y) * 0.79;
   float _dark = dm_t + dm_b;

   const float Pi = 6.28318530718;
   
   const float Directions = 16.0;
   const float Quality = 4.0;

   float Radius = 0.025 * _blur * 2.0;
   //float Radius = 0.025 * 2.0;

   vec4 Color = vec4(0);

   if(_dark <= 0.01)
   {
      Color = texture2D(sampler_1, fragTexCoord.xy);
   }
   else
   {
      for(float d = 0.0; d<Pi; d += Pi/Directions)
      {
         for(float i = 1.0 / Quality; i <= 1.001; i += 1.0 / Quality)
         {
            Color += texture2D(sampler_1, fragTexCoord.xy + vec2(cos(d),sin(d))*Radius*i);		
         }
      }

      Color /= Quality * Directions + 1.0;
   }


   vec2 FBOflipUV = vec2(fragTexCoord.x, 1.0 - fragTexCoord.y);

   vec4 tex_1 = texture2D(sampler_1,fragTexCoord.xy);
   vec4 tex_2 = texture2D(sampler_2,fragTexCoord.xy);

   vec3 FinalColour = mix(tex_2,Color, _blur).xyz;

   gl_FragColor = vec4(FinalColour * (1.0 - _dark), 1.0);
   //gl_FragColor = vec4(_blur,_blur,_blur, 1.0);
}
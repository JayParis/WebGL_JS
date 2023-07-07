precision mediump float;

varying vec4 fragTexCoord;
uniform sampler2D sampler;

void main()
{
   vec2 v_UV = gl_FragCoord.xy / fragTexCoord.zw;
   vec2 u_UV = fragTexCoord.xy;
   const float Pi = 6.28318530718;
   
   const float Directions = 16.0;
   const float Quality = 4.0;

   float bm_t = smoothstep(0.9,1.0,v_UV.y);
   float bm_b = smoothstep(0.5,0.0,v_UV.y);
   float _blur = bm_t + bm_b;

   float dm_t = smoothstep(0.9,1.0,v_UV.y) * 0.7;
   float dm_b = smoothstep(0.5,0.0,v_UV.y) * 0.9;
   float _dark = dm_t + dm_b;

   float Radius = 0.025 * _blur;

   vec4 Color = vec4(0);

   for(float d = 0.0; d<Pi; d += Pi/Directions)
   {
      for(float i = 1.0 / Quality; i <= 1.001; i += 1.0 / Quality)
      {
         Color += texture2D(sampler, u_UV + vec2(cos(d),sin(d))*Radius*i);		
      }
   }

   Color /= Quality * Directions + 1.0;
   Color *= 1.0 - _dark;
   gl_FragColor = vec4(Color.xyz, 1.0);
   //gl_FragColor = vec4(_dark,_dark,_dark, 1.0);
}
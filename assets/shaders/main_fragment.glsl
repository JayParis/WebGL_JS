precision mediump float;

varying vec2 fragTexCoord;
uniform sampler2D sampler;

void main()
{
   vec2 v_UV = gl_FragCoord.xy / vec2(500.0,907.0);
   const float Pi = 6.28318530718;
   
   const float Directions = 16.0;
   const float Quality = 4.0;

   float bMask = smoothstep(0.5,0.0,v_UV.y);
   float tMask = smoothstep(0.9,1.0,v_UV.y);
   float comb = tMask + bMask;

   float Radius = 0.025 * comb;

   vec4 Color = vec4(0);

   for(float d = 0.0; d<Pi; d += Pi/Directions)
   {
      for(float i = 1.0 / Quality; i <= 1.001; i += 1.0 / Quality)
      {
         Color += texture2D(sampler, fragTexCoord + vec2(cos(d),sin(d))*Radius*i);		
      }
   }

   Color /= Quality * Directions + 1.0;

   gl_FragColor = vec4(Color.xyz, 1.0);
}
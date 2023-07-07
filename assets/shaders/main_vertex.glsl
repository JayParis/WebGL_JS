precision mediump float;

attribute vec3 vertPosition;
attribute vec4 vertTexCoord;
varying vec4 fragTexCoord;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main()
{
   fragTexCoord = vertTexCoord;
   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}